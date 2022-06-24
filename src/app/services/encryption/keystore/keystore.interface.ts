export interface Keystore extends Serializable {
  /**
   * Return true if this keystore is intented to store the key for this url.
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
   */
  addKeys(keys: { [url: string]: string }): Promise<void>;

  /**
   * Return the storage of this keystore.
   */
  getStorage(): SecureRemoteStorage;

  /**
   * Return the type of the keystore instance.
   */
  getKeystoreType(): KeystoreType;
}

export interface SecureRemoteStorage extends Serializable {
  loadSecure(url: string): Promise<string>;
  saveSecure(url: string, data: string): Promise<void>;
}

export interface Serializable {
  serializeMetadata(): string;
}

export type KeystoreType = 'file' | 'folder';
