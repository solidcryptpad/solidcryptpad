import { FolderKeystore } from './folder-keystore.class';
import { KeystoreType, SecureRemoteStorage } from './keystore.interface';

/**
 * Manages all keys of received shared folders
 */
export class SharedFolderKeystore extends FolderKeystore {
  static override deserialize(
    serialization: string,
    storage: SecureRemoteStorage
  ): SharedFolderKeystore {
    const data = JSON.parse(serialization);
    return new SharedFolderKeystore(data.url, data.root, storage);
  }

  override getKeystoreType(): KeystoreType {
    return 'sharedFolder';
  }
}
