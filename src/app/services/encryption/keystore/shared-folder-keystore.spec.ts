import { SecureRemoteStorage } from './keystore.interface';
import { SharedFolderKeystore } from './shared-folder-keystore.class';

describe('SharedFolderKeystore', () => {
  let storage: jasmine.SpyObj<SecureRemoteStorage>;
  let keystore: SharedFolderKeystore;

  const exampleFolderUrl = 'https://example.org/folder/';
  const exampleKeystoreUrl = 'https://example.org/keystores/.keystore';

  beforeEach(() => {
    storage = jasmine.createSpyObj('SecureRemoteStorage', [
      'loadSecure',
      'saveSecure',
    ]);

    keystore = new SharedFolderKeystore(
      exampleKeystoreUrl,
      exampleFolderUrl,
      storage
    );
  });

  it('should create an instance', () => {
    const keystore = new SharedFolderKeystore(
      exampleKeystoreUrl,
      exampleFolderUrl,
      storage
    );

    expect(keystore).toBeTruthy();
  });

  it('getKeystoreType returns sharedFolder', () => {
    expect(keystore.getKeystoreType()).toBe('sharedFolder');
  });

  it('can serialize and deserialize with a storage', () => {
    const storage = keystore.getStorage();
    const serialization = keystore.serializeMetadata();

    expect(SharedFolderKeystore.deserialize(serialization, storage)).toEqual(
      keystore
    );
  });
});
