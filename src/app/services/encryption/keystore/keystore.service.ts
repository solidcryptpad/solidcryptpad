import { Injectable } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import {
  overwriteFile,
  getFile,
  FetchError,
} from '@inrupt/solid-client';
import { WrongMasterPasswordException } from 'src/app/exceptions/wrong-master-password-exception';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';
import { EncryptionService } from '../encryption/encryption.service';
import { MasterPasswordService } from '../master-password/master-password.service';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { FolderKeystore } from './folder-keystore.class';
import { throwWithContext } from 'src/app/exceptions/error-options';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  private readonly secureStorage: SecureRemoteStorage = {
    loadSecure: (url) => this.loadKeystore(url),
    saveSecure: (url, data) => this.saveKeystore(url, data),
  };

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

  async getResponsibleKeystore(url: string): Promise<FolderKeystore> {
    const keystores: FolderKeystore[] = await this.loadKeystores();
    const keystore = keystores.find((keystore) =>
      keystore.containsKeyForUrl(url)
    );
    if (!keystore)
      throw new KeyNotFoundException(`Could not find key for ${url}`);
    return keystore;
  }

  async addKeystore(keystore: FolderKeystore): Promise<void> {
    const keystores = await this.loadKeystores();
    keystores.push(keystore);
    await this.saveKeystores(keystores);
  }

  /**
   * Reloads the keystores from the solid pod and stores it in the local storage.
   */
  async loadKeystores(): Promise<FolderKeystore[]> {
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
      const keystoresData: KeystoreListEntry[] = JSON.parse(keystoresJSON);
      const keystores = keystoresData.map(
        (entry) => new FolderKeystore(entry.url, entry.root, this.secureStorage)
      );
      return keystores;
    } catch (error) {
      throw throwWithContext(
        'Could not load information about encryption keys'
      )(error as Error);
    }
  }

  async saveKeystores(keystores: FolderKeystore[]): Promise<void> {
    const keystoresUrl = await this.getKeystoresListUrl();
    const masterPassword = await this.masterPasswordService.getMasterPassword();
    const keystoresJSON = JSON.stringify(
      keystores.map((keystore) => keystore.toInfoJSON())
    );
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
    const ownPodKeystore = new FolderKeystore(
      keystoresFolder + 'root.json.enc',
      podRoot,
      this.secureStorage
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

  private async saveKeystore(url: string, data: string): Promise<void> {
    const masterPassword = await this.masterPasswordService.getMasterPassword();
    const encrypted = this.encryptionService.encryptString(
      data,
      masterPassword
    );
    await overwriteFile(url, new Blob([encrypted]), {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
      contentType: 'text/Plain',
    });
  }

  private async loadKeystore(url: string): Promise<string> {
    const res = await getFile(url, {
      fetch: this.authService.authenticatedFetch.bind(this.authService),
    });
    const encrypted = await res.text();
    const masterPassword = await this.masterPasswordService.getMasterPassword();
    try {
      return this.encryptionService.decryptString(encrypted, masterPassword);
    } catch (error) {
      // TODO: try to catch only decryption errors, not all.
      // The encryption service should convert those errors, and here we can use isntanceof
      throw new WrongMasterPasswordException(
        'It seems that you provided the wrong master password'
      );
    }
  }
}

interface KeystoreListEntry {
  url: string;
  root: string;
}

export interface SecureRemoteStorage {
  loadSecure(url: string): Promise<string>;
  saveSecure(url: string, data: string): Promise<void>;
}
