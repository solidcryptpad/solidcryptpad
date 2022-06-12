import { Injectable } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { overwriteFile, getFile, FetchError } from '@inrupt/solid-client';
import { WrongMasterPasswordException } from 'src/app/exceptions/wrong-master-password-exception';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';
import { EncryptionService } from '../encryption/encryption.service';
import { MasterPasswordService } from '../master-password/master-password.service';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { FolderKeystore } from './folder-keystore.class';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { KeystoreNotFoundException } from 'src/app/exceptions/keystore-not-found-exception';
import { Keystore, SecureRemoteStorage } from './keystore.interface';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  private keystores?: Keystore[];

  constructor(
    private encryptionService: EncryptionService,
    private masterPasswordService: MasterPasswordService,
    private profileService: ProfileService,
    private authService: SolidAuthenticationService
  ) {}

  private readonly keystoresFolderPath: string = 'solidcryptpad-keystores/';

  async getKey(url: string): Promise<string> {
    const keystore = await this.getResponsibleKeystore(url);
    return keystore.getKey(url);
  }

  async getOrCreateKey(url: string): Promise<string> {
    const keystore = await this.getResponsibleKeystore(url);
    return keystore.getKey(url).catch(async (error) => {
      if (error instanceof KeyNotFoundException) {
        const newKey = this.encryptionService.generateNewKey();
        await keystore.addKey(url, newKey);
        return newKey;
      }
      throw error;
    });
  }

  async getResponsibleKeystore(url: string): Promise<Keystore> {
    return this.findKeystore((keystore) => keystore.containsKeyForUrl(url));
  }

  async addKeystore(keystore: Keystore): Promise<void> {
    await this.loadKeystores();
    this.keystores?.push(keystore);
    // TODO: non-null assertion
    await this.saveKeystores(this.keystores!);
  }

  private async findKeystore(
    callback: (keystore: Keystore) => boolean
  ): Promise<Keystore> {
    let keystore = this.keystores?.find(callback);
    if (keystore) return keystore;
    await this.loadKeystores();
    keystore = this.keystores?.find(callback);
    if (keystore) return keystore;
    throw new KeystoreNotFoundException('Could not find keystore');
  }

  /**
   * Reloads the keystores from the solid pod and stores it in the local storage.
   */
  async loadKeystores(): Promise<void> {
    // TODO: save to localStorage and try to load from localstorage first
    try {
      await this.ensureKeystoresFolderSetup();
      const keystoresListUrl = await this.getKeystoresListUrl();
      // TODO: should not use getFile here directly
      const keystoresEncrypted = await getFile(keystoresListUrl, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      }).then((res) => res.text());
      const masterPassword =
        await this.masterPasswordService.getMasterPassword();
      const keystoresJSON = await this.encryptionService.decryptString(
        keystoresEncrypted,
        masterPassword
      );
      const keystoresSerialized: KeystoreSerialization[] =
        JSON.parse(keystoresJSON);
      const keystores: Keystore[] = keystoresSerialized.map(
        ({ keystoreSerialized, storageSerialized }) => {
          // TODO: switch depending on type
          const storage = this.deserializeSecureStorage(storageSerialized);
          return FolderKeystore.deserialize(keystoreSerialized, storage);
        }
      );
      this.keystores = keystores;
    } catch (error) {
      throw throwWithContext(
        'Could not load information about encryption keys'
      )(error as Error);
    }
  }

  async saveKeystores(keystores: Keystore[]): Promise<void> {
    const keystoresUrl = await this.getKeystoresListUrl();
    const masterPassword = await this.masterPasswordService.getMasterPassword();
    const keystoresSerialized: KeystoreSerialization[] = keystores.map(
      (keystore) => ({
        type: 'folder',
        keystoreSerialized: keystore.serialize(),
        storageSerialized: keystore.getStorage().serialize(),
      })
    );
    const keystoresJSON = JSON.stringify(keystoresSerialized);
    const encryptedKeystores = this.encryptionService.encryptString(
      keystoresJSON,
      masterPassword
    );

    // TODO: use service method instead
    await overwriteFile(keystoresUrl, new Blob([encryptedKeystores]), {
      contentType: 'text/plain',
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
  }

  /**
   * Check if the keystores folder is setup.
   * If not, create it with appropriate permissions and ask for master password to secure it
   */
  private async ensureKeystoresFolderSetup() {
    try {
      const keystoresUrl = await this.getKeystoresListUrl();
      await getFile(keystoresUrl, {
        fetch: this.authService.authenticatedFetch.bind(this.authService),
      });
    } catch (error) {
      if (error instanceof FetchError && error.statusCode == 404) {
        await this.setupMasterPassword();
        await this.setupKeystoresFolder();
      } else {
        throw error;
      }
    }
  }

  private async setupMasterPassword() {
    // TODO: shift responsibility to master-password service if possible
    if (this.masterPasswordService.checkMasterPasswordNotSet()) {
      const newMasterPassword =
        await this.masterPasswordService.openSetMasterPasswordDialog();
      // TODO: what if this is not set?
      if (newMasterPassword) {
        this.masterPasswordService.setMasterPassword(newMasterPassword);
      }
    }
  }

  private async setupKeystoresFolder() {
    const podRoot = (await this.profileService.getPodUrls())[0];
    const keystoresFolder = await this.getKeystoresFolderUrl();
    const encryptionKey = this.encryptionService.generateNewKey();
    const ownPodKeystore = new FolderKeystore(
      keystoresFolder + 'root.json.enc',
      podRoot,
      this.createSecureStorage(encryptionKey)
    );
    await this.saveKeystores([ownPodKeystore]);
  }

  private async getKeystoresListUrl(): Promise<string> {
    return (await this.getKeystoresFolderUrl()) + 'keystores.json.enc';
  }

  private async getKeystoresFolderUrl(): Promise<string> {
    const podUrls = await this.profileService.getPodUrls();
    return podUrls[0] + this.keystoresFolderPath;
  }

  private createSecureStorage(encryptionKey: string): SecureRemoteStorage {
    return {
      loadSecure: (url) => this.loadKeystore(url, encryptionKey),
      saveSecure: (url, data) => this.saveKeystore(url, data, encryptionKey),
      serialize: () => JSON.stringify({ encryptionKey }),
    };
  }

  private deserializeSecureStorage(serialization: string): SecureRemoteStorage {
    const { encryptionKey } = JSON.parse(serialization);
    return this.createSecureStorage(encryptionKey);
  }

  private async saveKeystore(
    url: string,
    data: string,
    encryptionKey: string
  ): Promise<void> {
    const encrypted = this.encryptionService.encryptString(data, encryptionKey);
    await overwriteFile(url, new Blob([encrypted]), {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
      contentType: 'text/Plain',
    });
  }

  private async loadKeystore(
    url: string,
    encryptionKey: string
  ): Promise<string> {
    const res = await getFile(url, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
    const encrypted = await res.text();
    try {
      return this.encryptionService.decryptString(encrypted, encryptionKey);
    } catch (error) {
      // TODO: try to catch only decryption errors, not all.
      // The encryption service should convert those errors, and here we can use isntanceof
      throw new WrongMasterPasswordException(
        'It seems that you provided the wrong master password'
      );
    }
  }
}

type KeystoreSerialization = {
  type: 'folder';
  keystoreSerialized: string;
  storageSerialized: string;
};
