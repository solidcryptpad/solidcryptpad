import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import {
  Keystore,
  KeystoreType,
  SecureRemoteStorage,
} from './keystore.interface';

/**
 * Manages all keys of a folder and its contents
 */
export class FolderKeystore implements Keystore {
  private keys: { [fileUrl: string]: string } = {};

  /**
   * @param keystoreUrl url where the keystore is stored on the pod
   * @param folderRoot url of the folder for which this keystore has the keys
   * @param storage storage that is used to save and load the keystore
   */
  constructor(
    private keystoreUrl: string,
    private folderRoot: string,
    private storage: SecureRemoteStorage
  ) {}

  handlesKeyForUrl(url: string) {
    return Promise.resolve(url.startsWith(this.folderRoot));
  }

  async getKey(url: string) {
    return this.getCachedKey(url) ?? this.getRemoteKey(url);
  }

  async getKeysAll() {
    await this.loadKeys();
    return { ...this.keys };
  }

  async addKey(url: string, key: string) {
    // a race condition can happen if in two tabs we add a key at the same time
    await this.loadKeys();
    this.keys[url] = key;
    await this.saveKeys();
  }

  async addKeys(keys: { [url: string]: string }): Promise<void> {
    await this.loadKeys();
    this.keys = {
      ...this.keys,
      ...keys,
    };
    await this.saveKeys();
  }

  private getCachedKey(url: string): string | undefined {
    return this.keys[url];
  }

  private async getRemoteKey(url: string): Promise<string> {
    await this.loadKeys();
    if (!this.keys[url])
      throw new KeyNotFoundException(`Could not find key for ${url}`);
    return this.keys[url];
  }

  private async loadKeys(): Promise<void> {
    try {
      const json = await this.storage.loadSecure(this.keystoreUrl);
      const data: FolderKeystoreJSON = JSON.parse(json);
      this.keys = data.keys;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.keys = {};
      } else
        throwWithContext(`Could not load keys for ${this.folderRoot}`)(
          error as Error
        );
    }
  }

  private async saveKeys(): Promise<void> {
    const data: FolderKeystoreJSON = { keys: this.keys };
    await this.storage.saveSecure(this.keystoreUrl, JSON.stringify(data));
  }

  getStorage(): SecureRemoteStorage {
    return this.storage;
  }

  serializeMetadata(): string {
    return JSON.stringify({
      url: this.keystoreUrl,
      root: this.folderRoot,
    });
  }

  getKeystoreType(): KeystoreType {
    return 'folder';
  }

  getFolderUrl(): string {
    return this.folderRoot;
  }

  getStorageUrl(): string {
    return this.keystoreUrl;
  }

  static deserialize(
    serialization: string,
    storage: SecureRemoteStorage
  ): FolderKeystore {
    const data = JSON.parse(serialization);
    return new FolderKeystore(data.url, data.root, storage);
  }
}

type FolderKeystoreJSON = {
  keys: {
    [fileUrl: string]: string;
  };
};
