import { SharedFileKeystore } from './shared-file-keystore.class';
import { SecureRemoteStorage } from './keystore.interface';
import { KeyNotFoundException } from '../../../exceptions/key-not-found-exception';
import { NotFoundException } from '../../../exceptions/not-found-exception';

describe('SharedFileKeystore', () => {
  const exampleKeystoreUrl =
    'https://example.org/example-data/shared-file-keystore.json.enc';

  const exampleBaseUrl = 'https://example.org/';
  const exampleFileUrl = exampleBaseUrl + 'example.txt';
  const exampleFileUrl2 = exampleBaseUrl + 'example2.txt';
  const exampleKey = 'key123';
  const exampleKey2 = 'key321';

  let storage: jasmine.SpyObj<SecureRemoteStorage>;
  let keystore: SharedFileKeystore;

  beforeEach(() => {
    storage = jasmine.createSpyObj('SecureRemoteStorage', [
      'loadSecure',
      'saveSecure',
    ]);

    keystore = new SharedFileKeystore(storage, exampleKeystoreUrl);
  });

  it('should create an instance', () => {
    const keystore = new SharedFileKeystore(storage, exampleKeystoreUrl);

    expect(keystore).toBeTruthy();
  });

  it('handlesKeyForUrl returns true for existing key', async () => {
    storage.loadSecure.and.resolveTo(
      JSON.stringify({
        keys: {
          [exampleFileUrl]: exampleKey,
        },
      })
    );
    await expectAsync(keystore.handlesKeyForUrl(exampleFileUrl)).toBeResolvedTo(
      true
    );
  });

  it('handlesKeyForUrl returns false for not existing key', async () => {
    storage.loadSecure.and.resolveTo(
      JSON.stringify({
        keys: {
          [exampleFileUrl]: exampleKey,
        },
      })
    );
    await expectAsync(keystore.handlesKeyForUrl('doesNotExist')).toBeResolvedTo(
      false
    );
  });

  it('getKey returns key after addKey', async () => {
    storage.loadSecure.and.resolveTo(JSON.stringify({ keys: {} }));
    storage.saveSecure.and.resolveTo();
    const getKeySpy = spyOn<any>(keystore, 'getKey').and.callThrough();

    await keystore.addKey(exampleFileUrl, exampleKey);

    const key = await keystore.getKey(exampleFileUrl);

    expect(key).toBe(exampleKey);
    expect(getKeySpy).toHaveBeenCalledTimes(1);
  });

  it('getKey throws KeyNotFoundException if the key does not exist', async () => {
    storage.loadSecure.and.resolveTo(JSON.stringify({ keys: {} }));

    await expectAsync(keystore.getKey('doesNotExist')).toBeRejectedWithError(
      KeyNotFoundException
    );
  });

  it('getKey throws KeyNotFoundException if storage throws NotFoundException', async () => {
    storage.loadSecure.and.rejectWith(
      new NotFoundException('this keystore does not exist yet')
    );

    await expectAsync(keystore.getKey('doesNotExist')).toBeRejectedWithError(
      KeyNotFoundException
    );
  });

  it('getKeysAll fetches and returns all keys', async () => {
    const keys = {
      [exampleFileUrl]: exampleKey,
      [exampleFileUrl2]: exampleKey2,
    };
    storage.loadSecure.and.resolveTo(JSON.stringify({ keys }));

    const fetchedKeys = await keystore.getKeysAll();

    expect(fetchedKeys).toEqual(keys);
  });

  it('addKeys stores all provided keys', async () => {
    const oldKeys = {
      [`${exampleBaseUrl}old.txt`]: 'old23',
    };

    const newKeys = {
      [exampleFileUrl]: exampleKey,
      [exampleFileUrl2]: exampleKey2,
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

  it('getKeystoreType returns sharedFile', () => {
    expect(keystore.getKeystoreType()).toBe('sharedFile');
  });

  it('can serialize and deserialize with a storage', () => {
    const storage = keystore.getStorage();
    const serialization = keystore.serializeMetadata();

    expect(SharedFileKeystore.deserialize(serialization, storage)).toEqual(
      keystore
    );
  });
});
