export interface Keystore extends Serializable {
  containsKeyForUrl(url: string): boolean;
  getKey(url: string): Promise<string>;
  addKey(url: string, key: string): Promise<void>;
  getStorage(): SecureRemoteStorage;
}

export interface SecureRemoteStorage extends Serializable {
  loadSecure(url: string): Promise<string>;
  saveSecure(url: string, data: string): Promise<void>;
}

export interface Serializable {
  serialize(): string;
}
