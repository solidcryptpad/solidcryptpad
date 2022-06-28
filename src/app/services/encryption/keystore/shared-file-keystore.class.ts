import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import {
  Keystore,
  KeystoreType,
  SecureRemoteStorage,
} from './keystore.interface';

/**
 * Manages all keys of received shared files
 */
export class SharedFileKeystore implements Keystore {
  private keys: { [fileUrl: string]: string } = {};

  /**
   * @param keystoreUrl url where the keystore is stored on the pod
   * @param storage storage that is used to save and load the keystore
   */
  constructor(
    private storage: SecureRemoteStorage,
    private keystoreUrl: string
  ) {}

  async handlesKeyForUrl(url: string) {
    const entry = this.keys[url];
    if (!entry) {
      await this.loadKeys();
    }

    return this.keys.hasOwnProperty(url);
  }

  async getKey(url: string) {
    return this.keys[url] ?? this.getRemoteKey(url);
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

  private async getRemoteKey(url: string): Promise<string> {
    await this.loadKeys();
    if (!this.keys[url])
      throw new KeyNotFoundException(`Could not find key for ${url}`);
    return this.keys[url];
  }

  private async loadKeys(): Promise<void> {
    try {
      const json = await this.storage.loadSecure(this.keystoreUrl);
      const data: FileKeystoreJSON = JSON.parse(json);
      this.keys = data.keys;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.keys = {};
      } else
        throwWithContext(`Could not load keys for ${this.keystoreUrl}`)(
          error as Error
        );
    }
  }

  private async saveKeys(): Promise<void> {
    const data: FileKeystoreJSON = { keys: this.keys };
    await this.storage.saveSecure(this.keystoreUrl, JSON.stringify(data));
  }

  getStorage(): SecureRemoteStorage {
    return this.storage;
  }

  getStorageUrl(): string {
    return this.keystoreUrl;
  }

  serializeMetadata(): string {
    return JSON.stringify({
      url: this.keystoreUrl,
    });
  }

  static deserialize(
    serialization: string,
    storage: SecureRemoteStorage
  ): SharedFileKeystore {
    const data = JSON.parse(serialization);
    return new SharedFileKeystore(storage, data.url);
  }

  getKeystoreType(): KeystoreType {
    return 'sharedFile';
  }
}

type FileKeystoreJSON = {
  keys: {
    [fileUrl: string]: string;
  };
};
