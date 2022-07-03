import { InvalidKeystoreException } from 'src/app/exceptions/invalid-keystore';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import { DirectoryStructureService } from '../../directory-structure/directory-structure.service';
import { FolderKeystore } from './folder-keystore.class';
import { SecureRemoteStorage } from './keystore.interface';

describe('FolderKeystore', () => {
  let storage: jasmine.SpyObj<SecureRemoteStorage>;
  let keystore: FolderKeystore;
  let directoryServiceSpy: jasmine.SpyObj<DirectoryStructureService>;

  const exampleFolderUrl = 'https://example.org/folder/';
  const exampleKeystoreUrl = 'https://example.org/keystores/.keystore';

  const givenKeystoreForFolder = (folderUrl: string) =>
    new FolderKeystore(
      exampleKeystoreUrl,
      folderUrl,
      storage,
      directoryServiceSpy
    );

  beforeEach(() => {
    storage = jasmine.createSpyObj('SecureRemoteStorage', [
      'loadSecure',
      'saveSecure',
    ]);
    directoryServiceSpy = jasmine.createSpyObj('DirectoryServiceSpy', [
      'isKeystoreForResource',
    ]);
    keystore = new FolderKeystore(
      'https://example.org/.keystore',
      'https://example.org/folder/',
      storage,
      directoryServiceSpy
    );
  });

  it('should create an instance', () => {
    const keystore = new FolderKeystore(
      exampleKeystoreUrl,
      exampleFolderUrl,
      storage,
      directoryServiceSpy
    );

    expect(keystore).toBeTruthy();
  });

  it('handlesKeyForUrl returns true for nested file in it', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(true);
    const keystore = givenKeystoreForFolder(exampleFolderUrl);
    await expectAsync(
      keystore.handlesKeyForUrl(exampleFolderUrl + 'nested/file.txt')
    ).toBeResolvedTo(true);
  });

  it('handlesKeyForUrl returns false for a file on a different origin', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(false);
    const keystore = givenKeystoreForFolder(exampleFolderUrl);
    await expectAsync(
      keystore.handlesKeyForUrl('https://other.org/folder/file.txt')
    ).toBeResolvedTo(false);
  });

  it('getKey returns cached key after addKey', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(true);
    storage.loadSecure.and.resolveTo(JSON.stringify({ keys: {} }));
    storage.saveSecure.and.resolveTo();
    const getCachedKeySpy = spyOn<any>(
      keystore,
      'getCachedKey'
    ).and.callThrough();
    const getRemoteKeySpy = spyOn<any>(
      keystore,
      'getRemoteKey'
    ).and.callThrough();

    await keystore.addKey(`${exampleFolderUrl}file.txt`, 'the key');
    const key = await keystore.getKey(`${exampleFolderUrl}file.txt`);

    expect(key).toBe('the key');
    expect(getCachedKeySpy).toHaveBeenCalledTimes(1);
    expect(getRemoteKeySpy).not.toHaveBeenCalled();
  });

  it('getKey fetches keystore if key is not cached', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(true);
    const url = `${exampleFolderUrl}file.txt`;
    storage.loadSecure.and.resolveTo(
      JSON.stringify({
        keys: {
          [url]: 'the key',
        },
      })
    );
    spyOn<any>(keystore, 'getCachedKey').and.returnValue(undefined);

    const key = await keystore.getKey(url);

    expect(key).toBe('the key');
  });

  it('getKey throws KeyNotFoundException if the key is not stored', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(true);
    storage.loadSecure.and.resolveTo(JSON.stringify({ keys: {} }));

    await expectAsync(
      keystore.getKey(exampleFolderUrl + 'file.txt')
    ).toBeRejectedWithError(KeyNotFoundException);
  });

  it('getKey throws KeyNotFoundException if storage throws NotFoundException', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(true);
    storage.loadSecure.and.rejectWith(
      new NotFoundException('this keystore does not exist yet')
    );

    await expectAsync(
      keystore.getKey(exampleFolderUrl + 'file.txt')
    ).toBeRejectedWithError(KeyNotFoundException);
  });

  it('getKey throws KeyNotFoundException if key is for a different pod than the keystore', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(false);
    const url = `${exampleFolderUrl}file.txt`;
    storage.loadSecure.and.resolveTo(
      JSON.stringify({
        keys: {
          [url]: 'the key',
        },
      })
    );
    spyOn<any>(keystore, 'getCachedKey').and.returnValue(undefined);

    await expectAsync(keystore.getKey(url)).toBeRejectedWithError(
      KeyNotFoundException
    );
  });

  it('getKeysAll fetches and returns all keys', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(true);
    const keys = {
      [`${exampleFolderUrl}file.txt`]: 'the key',
      [`${exampleFolderUrl}nested/nested.txt`]: 'the other key',
    };
    storage.loadSecure.and.resolveTo(JSON.stringify({ keys }));

    const fetchedKeys = await keystore.getKeysAll();

    expect(fetchedKeys).toEqual(keys);
  });

  it('getKeysAll throws if it contains a key for a different pod', async () => {
    directoryServiceSpy.isKeystoreForResource.and.returnValue(false);
    const keys = {
      [`${exampleFolderUrl}file.txt`]: 'the key',
      [`${exampleFolderUrl}nested/nested.txt`]: 'the other key',
    };
    storage.loadSecure.and.resolveTo(JSON.stringify({ keys }));

    await expectAsync(keystore.getKeysAll()).toBeRejectedWithError(
      InvalidKeystoreException
    );
  });

  it('addKeys stores all provided keys', async () => {
    const oldKeys = {
      [`${exampleFolderUrl}oldfile.txt`]: 'the old key',
    };
    const newKeys = {
      [`${exampleFolderUrl}file.txt`]: 'the key',
      [`${exampleFolderUrl}nested/nested.txt`]: 'the other key',
    };
    storage.loadSecure.and.resolveTo(JSON.stringify({ keys: oldKeys }));
    storage.saveSecure.and.resolveTo();

    await keystore.addKeys(newKeys);

    const saveSecureArgs = await storage.saveSecure.calls.first();
    expect(saveSecureArgs.args[1]).toEqual(
      JSON.stringify({ keys: { ...oldKeys, ...newKeys } })
    );
  });

  it('getStorage returns storage', () => {
    expect(keystore.getStorage()).toBe(storage);
  });

  it('getKeystoreType returns folder', () => {
    expect(keystore.getKeystoreType()).toBe('folder');
  });

  it('can serialize and deserialize with a storage', () => {
    const storage = keystore.getStorage();
    const serialization = keystore.serializeMetadata();

    expect(
      FolderKeystore.deserialize(serialization, storage, directoryServiceSpy)
    ).toEqual(keystore);
  });
});
