import { Injectable } from '@angular/core';
import { EncryptionService } from '../encryption/encryption.service';
import { MasterPasswordService } from '../master-password/master-password.service';
import { FolderKeystore } from './folder-keystore.class';
import { throwWithContext } from 'src/app/exceptions/error-options';
import {
  Keystore,
  KeystoreType,
  SecureRemoteStorage,
} from './keystore.interface';
import { KeystoreStorageService } from './keystore-storage.service';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';
import { SharedFileKeystore } from './shared-file-keystore.class';
import { KeystoreNotFoundException } from '../../../exceptions/keystore-not-found-exception';
import { SharedFolderKeystore } from './shared-folder-keystore.class';
import { DirectoryStructureService } from '../../directory-structure/directory-structure.service';

@Injectable({
  providedIn: 'root',
})
export class KeystoreService {
  private keystores?: Keystore[];

  constructor(
    private encryptionService: EncryptionService,
    private masterPasswordService: MasterPasswordService,
    private fileService: SolidFileHandlerService,
    private keystoreStorageService: KeystoreStorageService,
    private directoryService: DirectoryStructureService
  ) {}

  async getKeystores(): Promise<Keystore[]> {
    await this.loadKeystores();
    return this.keystores!;
  }

  /**
   * Reload the keystores from the solid pod and stores it in this.keystores
   */
  async loadKeystores(): Promise<void> {
    try {
      await this.ensureKeystoresFolderSetup();
      const keystoresSerialized = await this.fetchSerializedKeystoresMetadata();
      this.keystores =
        this.parseSerializedKeystoresMetadata(keystoresSerialized);
    } catch (error: any) {
      if (error.message == 'Malformed UTF-8 data') {
        this.masterPasswordService.clearMasterPassword();
        await this.loadKeystores();
      } else {
        throw throwWithContext(
          'Could not load information about encryption keys'
        )(error as Error);
      }
    }
  }

  private async fetchSerializedKeystoresMetadata(): Promise<
    KeystoreSerialization[]
  > {
    const masterPassword = await this.masterPasswordService.getMasterPassword();
    const keystoresMetadataUrl = await this.getKeystoresMetadataUrl();
    const keystoresEncrypted = await this.fileService
      .readFile(keystoresMetadataUrl)
      .then((res) => res.text());
    const keystoresJSON = this.encryptionService.decryptString(
      keystoresEncrypted,
      masterPassword
    );
    const keystoresSerialized: KeystoreSerialization[] =
      JSON.parse(keystoresJSON);
    return keystoresSerialized;
  }

  private parseSerializedKeystoresMetadata(
    serializedMetadata: KeystoreSerialization[]
  ): Keystore[] {
    return serializedMetadata.map(
      ({ type, keystoreSerialized, storageSerialized }) => {
        const storage =
          this.keystoreStorageService.deserializeSecureStorage(
            storageSerialized
          );
        return this.deserializeKeystore(keystoreSerialized, type, storage);
      }
    );
  }

  async saveKeystoresMetadata(): Promise<void> {
    if (!this.keystores) return;
    const masterPassword = await this.masterPasswordService.getMasterPassword();
    const keystoresMetadataUrl = await this.getKeystoresMetadataUrl();
    const keystoresSerialized = this.keystores.map(this.serializeKeystore);
    const keystoresJSON = JSON.stringify(keystoresSerialized);
    const encryptedKeystores = this.encryptionService.encryptString(
      keystoresJSON,
      masterPassword
    );
    await this.fileService.writeFile(
      new Blob([encryptedKeystores], { type: 'text/plain' }),
      keystoresMetadataUrl
    );
  }

  private serializeKeystore(keystore: Keystore): KeystoreSerialization {
    return {
      type: keystore.getKeystoreType(),
      keystoreSerialized: keystore.serializeMetadata(),
      storageSerialized: keystore.getStorage().serializeMetadata(),
    };
  }

  private deserializeKeystore(
    keystoreSerialized: string,
    keystoreType: KeystoreType,
    storage: SecureRemoteStorage
  ): Keystore {
    switch (keystoreType) {
      case 'folder':
        return FolderKeystore.deserialize(keystoreSerialized, storage);

      case 'sharedFile':
        return SharedFileKeystore.deserialize(keystoreSerialized, storage);

      case 'sharedFolder':
        return SharedFolderKeystore.deserialize(keystoreSerialized, storage);
    }
  }

  async createEmptyFolderKeystore(folderUrl: string): Promise<FolderKeystore> {
    const keystoreUrl =
      (await this.getKeystoresFolderUrl()) +
      this.encryptionService.generateNewKey() +
      '.shared-keystore';
    const encryptionKey = this.encryptionService.generateNewKey();
    const storage =
      this.keystoreStorageService.createSecureStorage(encryptionKey);
    const keystore = new FolderKeystore(keystoreUrl, folderUrl, storage);
    await this.addKeystore(keystore);
    return keystore;
  }

  async addKeystore(keystore: Keystore): Promise<void> {
    await this.loadKeystores();
    this.keystores?.push(keystore);
    await this.saveKeystoresMetadata();
  }

  async findAllKeystores(
    callback: (keystore: Keystore) => Promise<boolean>
  ): Promise<Keystore[]> {
    await this.loadKeystores();
    return filterAsync(this.keystores || [], callback);
  }

  /**
   * Check if the keystores folder is set up.
   * If not, create it with appropriate permissions and ask for master password to secure it
   */
  private async ensureKeystoresFolderSetup() {
    const keystoresUrl = await this.getKeystoresMetadataUrl();
    if (!(await this.fileService.resourceExists(keystoresUrl))) {
      await this.masterPasswordService.setupMasterPassword();
      await this.setupKeystoresFolder();
    }
  }

  async sharedFilesKeystoreExists() {
    const keystoreUrl = await this.getSharedFilesKeystoreUrl();
    return this.fileService.resourceExists(keystoreUrl);
  }

  private async setupKeystoresFolder() {
    const rootDirectory = await this.directoryService.getRootDirectory();
    const keystoresFolder = await this.getKeystoresFolderUrl();
    const encryptionKeyForFolders = this.encryptionService.generateNewKey();
    const encryptionKeyForSharedFiles = this.encryptionService.generateNewKey();

    const ownPodKeystore = new FolderKeystore(
      keystoresFolder + 'root.json.enc',
      rootDirectory,
      this.keystoreStorageService.createSecureStorage(encryptionKeyForFolders)
    );

    const sharedFileKeystore = new SharedFileKeystore(
      this.keystoreStorageService.createSecureStorage(
        encryptionKeyForSharedFiles
      ),
      keystoresFolder + 'shared-files.json.enc'
    );

    this.keystores = [ownPodKeystore, sharedFileKeystore];

    await this.saveKeystoresMetadata();
  }

  async getSharedFilesKeystore(): Promise<SharedFileKeystore> {
    await this.loadKeystores();
    const keystore = this.keystores?.find(
      (element) => element instanceof SharedFileKeystore
    ) as SharedFileKeystore;

    if (!keystore) {
      throw new KeystoreNotFoundException('No keystore found!');
    }

    return keystore;
  }

  async getSharedFolderKeystores(): Promise<SharedFolderKeystore[]> {
    await this.loadKeystores();
    return this.keystores?.filter(
      (element) => element instanceof SharedFolderKeystore
    ) as SharedFolderKeystore[];
  }

  private async getKeystoresMetadataUrl(): Promise<string> {
    return (
      (await this.directoryService.getKeystoresDirectory()) +
      'keystores.json.enc'
    );
  }

  private async getKeystoresFolderUrl(): Promise<string> {
    return this.directoryService.getKeystoresDirectory();
  }

  private async getSharedFilesKeystoreUrl(): Promise<string> {
    return (
      (await this.directoryService.getKeystoresDirectory()) +
      'shared-files.json.enc'
    );
  }
}

type KeystoreSerialization = {
  type: KeystoreType;
  keystoreSerialized: string;
  storageSerialized: string;
};

function mapAsync<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<U>
): Promise<U[]> {
  return Promise.all(array.map(callbackfn));
}

async function filterAsync<T>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>
): Promise<T[]> {
  const filterMap = await mapAsync(array, callbackfn);
  return array.filter((value, index) => filterMap[index]);
}
