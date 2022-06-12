import { FetchError } from '@inrupt/solid-client';
import { throwWithContext } from 'src/app/exceptions/error-options';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { Keystore, SecureRemoteStorage } from './keystore.interface';

/**
 * Manages all keys of a folder and its contents
 */
export class FolderKeystore implements Keystore {
  private keys: { [fileUrl: string]: string } = {};

  /**
   * @param url url where the keystore is stored on the pod
   * @param root url of the folder for which this keystore has the keys
   * @param storage storage that is used to save and load the keystore
   */
  constructor(
    private url: string,
    private root: string,
    private storage: SecureRemoteStorage
  ) {}

  containsKeyForUrl(url: string): boolean {
    return url.startsWith(this.root);
  }

  async getKey(url: string): Promise<string> {
    return this.keys[url] ?? this.getRemoteKey(url);
  }

  async addKey(url: string, key: string): Promise<void> {
    // a race condition can happen if in two tabs we add a key at the same time
    await this.loadKeys();
    this.keys[url] = key;
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
      const json = await this.storage.loadSecure(this.url);
      const data: FolderKeystoreJSON = JSON.parse(json);
      this.keys = data.keys;
    } catch (error) {
      if (error instanceof FetchError && error.statusCode === 404) {
        this.keys = {};
      } else
        throwWithContext(`Could not load keys for ${this.root}`)(
          error as Error
        );
    }
  }

  private async saveKeys(): Promise<void> {
    const data: FolderKeystoreJSON = { keys: this.keys };
    await this.storage.saveSecure(this.url, JSON.stringify(data));
  }

  getStorage(): SecureRemoteStorage {
    return this.storage;
  }

  serialize(): string {
    return JSON.stringify({
      url: this.url,
      root: this.root,
      storage: this.storage.serialize(),
    });
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
