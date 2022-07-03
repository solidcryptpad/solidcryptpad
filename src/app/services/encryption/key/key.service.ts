import { Injectable } from '@angular/core';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { EncryptionService } from '../encryption/encryption.service';
import { FolderKeystore } from '../keystore/folder-keystore.class';
import { KeystoreService } from '../keystore/keystore.service';

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  constructor(
    private keystoreService: KeystoreService,
    private encryptionService: EncryptionService
  ) {}

  /**
   * Search through all responsible keystores. Return the first found key for this url
   */
  async getKey(url: string): Promise<string> {
    const keystores = await this.keystoreService.findAllKeystores((keystore) =>
      keystore.handlesKeyForUrl(url)
    );
    return Promise.any(keystores.map((keystore) => keystore.getKey(url))).catch(
      (aggregateError) => {
        throw new KeyNotFoundException(`Could not find key for ${url}`, {
          cause: aggregateError,
        });
      }
    );
  }

  /**
   * Try to get the corresponding key. If it is not found, create and store a new key.
   */
  async getOrCreateKey(url: string): Promise<string> {
    return this.getKey(url).catch(async (error) => {
      if (!(error instanceof KeyNotFoundException)) throw error;

      const newKey = this.encryptionService.generateNewKey();
      await this.addKeyToKeystores(url, newKey);
      return newKey;
    });
  }

  /**
   * Add a key for an url to all responsible keystores
   */
  private async addKeyToKeystores(url: string, key: string): Promise<void> {
    const keystores = await this.keystoreService.findAllKeystores((keystore) =>
      keystore.handlesKeyForUrl(url)
    );
    await Promise.all(keystores.map((keystore) => keystore.addKey(url, key)));
  }

  /**
   * Create a folder keystore if it does not exist.
   * Then return metadata for this keystore.
   */
  async getOrCreateFolderKeystore(
    folderUrl: string
  ): Promise<{ keystoreUrl: string; encryptionKey: string }> {
    const keystores = (await this.keystoreService.findAllKeystores((keystore) =>
      Promise.resolve(
        keystore instanceof FolderKeystore &&
          keystore.getFolderUrl() === folderUrl
      )
    )) as FolderKeystore[];

    if (!keystores.length) {
      keystores.push(await this.createFolderKeystore(folderUrl));
    }
    const keystoreUrl = keystores[0].getStorageUrl();
    const encryptionKey = keystores[0].getStorage().getEncryptionKey();

    return { keystoreUrl, encryptionKey };
  }

  /**
   * Create a folder keystore and initialize with existing keys in this folder
   */
  private async createFolderKeystore(
    folderUrl: string
  ): Promise<FolderKeystore> {
    const keystore = await this.keystoreService.createEmptyFolderKeystore(
      folderUrl
    );
    const existingKeys = await this.getKeysInFolder(folderUrl);
    await keystore.addKeys(existingKeys);
    return keystore;
  }

  private async getKeysInFolder(
    folderUrl: string
  ): Promise<{ [url: string]: string }> {
    const keys = await this.getKeysAll();
    return Object.fromEntries(
      Object.entries(keys).filter(([url]) => url.startsWith(folderUrl))
    );
  }

  private async getKeysAll(): Promise<{ [url: string]: string }> {
    const keystores = await this.keystoreService.getKeystores();
    const promises = keystores.map((keystore) => keystore.getKeysAll()) || [];
    const keys = (await Promise.all(promises)).reduce((allKeys, keys) => ({
      ...allKeys,
      ...keys,
    }));
    return keys;
  }
}
