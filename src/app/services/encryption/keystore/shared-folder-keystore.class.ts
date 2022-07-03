import { DirectoryStructureService } from '../../directory-structure/directory-structure.service';
import { FolderKeystore } from './folder-keystore.class';
import { KeystoreType, SecureRemoteStorage } from './keystore.interface';

/**
 * Manages all keys of received shared folders
 */
export class SharedFolderKeystore extends FolderKeystore {
  static override deserialize(
    serialization: string,
    storage: SecureRemoteStorage,
    directoryService: DirectoryStructureService
  ): SharedFolderKeystore {
    const data = JSON.parse(serialization);
    return new SharedFolderKeystore(
      data.url,
      data.root,
      storage,
      directoryService
    );
  }

  override getKeystoreType(): KeystoreType {
    return 'sharedFolder';
  }
}
