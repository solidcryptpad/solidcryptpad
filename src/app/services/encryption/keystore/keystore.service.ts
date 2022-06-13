import { Injectable } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { EncryptionService } from '../encryption/encryption.service';
import { MasterPasswordService } from '../master-password/master-password.service';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { FolderKeystore } from './folder-keystore.class';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { KeystoreNotFoundException } from 'src/app/exceptions/keystore-not-found-exception';
import { Keystore } from './keystore.interface';
import { KeystoreStorageService } from './keystore-storage.service';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  private keystores?: Keystore[];

  constructor(
    private encryptionService: EncryptionService,
    private masterPasswordService: MasterPasswordService,
    private profileService: ProfileService,
    private fileService: SolidFileHandlerService,
    private keystoreStorageService: KeystoreStorageService
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
        // iterating through all, because multiple folders could contain the key (e.g. the own root keystore, and the shared keystore)
        const keystores = await this.findKeystoreAll((keystore) =>
          keystore.handlesKeyForUrl(url)
        );
        await Promise.all(
          keystores.map((keystore) => keystore.addKey(url, newKey))
        );
        return newKey;
      }
      throw error;
    });
  }

  async getResponsibleKeystore(url: string): Promise<Keystore> {
    return this.findKeystore((keystore) => keystore.handlesKeyForUrl(url));
  }

  async addKeystore(keystore: Keystore): Promise<void> {
    await this.loadKeystores();
    this.keystores?.push(keystore);
    await this.saveKeystores();
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

  private async findKeystoreAll(
    callback: (keystore: Keystore) => boolean
  ): Promise<Keystore[]> {
    await this.loadKeystores();
    return this.keystores?.filter(callback) || [];
  }

  async getKeysInFolder(folderUrl: string): Promise<{ [url: string]: string }> {
    const keys = await this.getKeysAll();
    return Object.fromEntries(
      Object.entries(keys).filter(([url]) => url.startsWith(folderUrl))
    );
  }

  private async getKeysAll(): Promise<{ [url: string]: string }> {
    await this.loadKeystores();
    const promises =
      this.keystores?.map((keystore) => keystore.getKeysAll()) || [];
    const keys = (await Promise.all(promises)).reduce((allKeys, keys) => ({
      ...allKeys,
      ...keys,
    }));
    return keys;
  }

  /**
   * Reloads the keystores from the solid pod and stores it in the local storage.
   */
  async loadKeystores(): Promise<void> {
    try {
      await this.ensureKeystoresFolderSetup();
      const keystoresListUrl = await this.getKeystoresListUrl();
      const keystoresEncrypted = await this.fileService
        .readFile(keystoresListUrl)
        .then((res) => res.text());
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
          const storage =
            this.keystoreStorageService.deserializeSecureStorage(
              storageSerialized
            );
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

  async saveKeystores(): Promise<void> {
    if (!this.keystores) return;
    const keystoresUrl = await this.getKeystoresListUrl();
    const masterPassword = await this.masterPasswordService.getMasterPassword();
    const keystoresSerialized: KeystoreSerialization[] = this.keystores.map(
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

    await this.fileService.writeFile(
      new Blob([encryptedKeystores], { type: 'text/plain' }),
      keystoresUrl
    );
  }

  /**
   * Check if the keystores folder is setup.
   * If not, create it with appropriate permissions and ask for master password to secure it
   */
  private async ensureKeystoresFolderSetup() {
    const keystoresUrl = await this.getKeystoresListUrl();
    if (!(await this.fileService.fileExists(keystoresUrl))) {
      await this.setupMasterPassword();
      await this.setupKeystoresFolder();
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
      this.keystoreStorageService.createSecureStorage(encryptionKey)
    );
    this.keystores = [ownPodKeystore];
    await this.saveKeystores();
  }

  private async getKeystoresListUrl(): Promise<string> {
    return (await this.getKeystoresFolderUrl()) + 'keystores.json.enc';
  }

  private async getKeystoresFolderUrl(): Promise<string> {
    const podUrls = await this.profileService.getPodUrls();
    return podUrls[0] + this.keystoresFolderPath;
  }
}

type KeystoreSerialization = {
  type: 'folder';
  keystoreSerialized: string;
  storageSerialized: string;
};
