export interface Keystore extends Serializable {
  /**
   * Return true if this keystore is intented to store the key for this url.
   * Must return false if the keystore is untrusted and the url is not on the same pod as the keystore.
   */
  handlesKeyForUrl(url: string): Promise<boolean>;

  /**
   * Return the key for this url.
   *
   * @throws KeyNotFoundException
   */
  getKey(url: string): Promise<string>;

  /**
   * Get all keys of this keystore.
   */
  getKeysAll(): Promise<{ [url: string]: string }>;

  /**
   * Add a key for an url to this keystore and save it to the storage.
   */
  addKey(url: string, key: string): Promise<void>;

  /**
   * Add multiple keys to this keystore and save them to the storage.
   * Must throw if the keystore is untrusted and one of the urls is not on the same pod as the keystore.
   */
  addKeys(keys: { [url: string]: string }): Promise<void>;

  /**
   * Return the storage of this keystore.
   */
  getStorage(): SecureRemoteStorage;

  /**
   * Return the url where the keystore is stored at
   */
  getStorageUrl(): string;

  /**
   * Return the type of the keystore instance.
   */
  getKeystoreType(): KeystoreType;
}

export interface SecureRemoteStorage extends Serializable {
  loadSecure(url: string): Promise<string>;
  saveSecure(url: string, data: string): Promise<void>;
  getEncryptionKey(): string;
}

export interface Serializable {
  serializeMetadata(): string;
}

export type KeystoreType = 'folder' | 'sharedFile' | 'sharedFolder';
