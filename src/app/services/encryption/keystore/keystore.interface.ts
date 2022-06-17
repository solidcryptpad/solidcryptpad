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
   * Add a key for url to this keystore.
   */
  addKey(url: string, key: string): Promise<void>;

  /**
   * Add multiple keys to this keystore.
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
