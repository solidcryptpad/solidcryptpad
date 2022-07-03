import { TestBed } from '@angular/core/testing';
import { EncryptionService } from '../encryption/encryption.service';
import { KeystoreService } from '../keystore/keystore.service';

import { KeyService } from './key.service';
import { SecureRemoteStorage } from '../keystore/keystore.interface';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';
import { KeyNotFoundException } from 'src/app/exceptions/key-not-found-exception';

describe('KeyService', () => {
  let service: KeyService;
  let keystoreServiceSpy: jasmine.SpyObj<KeystoreService>;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;
  let storage: jasmine.SpyObj<SecureRemoteStorage>;

  const createKeystoreSpy = () =>
    jasmine.createSpyObj('Keystore', ['getKey', 'addKey']);
  const createFolderKeystoreSpy = () =>
    jasmine.createSpyObj('FolderKeystore', [
      'getKey',
      'addKey',
      'addKeys',
      'getKeysAll',
      'getFolderUrl',
      'getStorage',
      'getStorageUrl',
    ]);

  beforeEach(() => {
    const authenticationSpyObj = jasmine.createSpyObj(
      'SolidAuthenticationSpy',
      ['writeKeystoreToPod', 'loadKeystore']
    );

    const keystoreSpy = jasmine.createSpyObj('KeystoreService', [
      'findAllKeystores',
      'getKey',
      'createEmptyFolderKeystore',
      'getKeystores',
    ]);
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', [
      'generateNewKey',
    ]);

    storage = jasmine.createSpyObj('SecureRemoteStorage', [
      'loadSecure',
      'saveSecure',
      'getEncryptionKey',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: KeystoreService, useValue: keystoreSpy },
        { provide: EncryptionService, useValue: encryptionSpy },
        { provide: SolidAuthenticationService, useValue: authenticationSpyObj },
      ],
    });

    service = TestBed.inject(KeyService);
    keystoreServiceSpy = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
    encryptionServiceSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;
  });

  it('should be created', async () => {
    expect(service).toBeTruthy();
  });

  it('getKey returns correct key if at least one keystore has it', async () => {
    const keystore = createKeystoreSpy();
    keystore.getKey.withArgs('example.com').and.resolveTo('the key');
    keystoreServiceSpy.findAllKeystores.and.resolveTo([keystore]);

    expect(await service.getKey('example.com')).toBe('the key');
  });

  it('getKey throws KeyNotFoundException if no keystore has the key', async () => {
    const keystore = createKeystoreSpy();
    keystore.getKey.and.rejectWith(new KeyNotFoundException('not found'));
    keystoreServiceSpy.findAllKeystores.and.resolveTo([keystore]);

    await expectAsync(service.getKey('not.existing.com')).toBeRejectedWithError(
      KeyNotFoundException
    );
  });

  it('getOrCreateKey creates new key', async () => {
    const keystore = createKeystoreSpy();
    keystore.getKey.and.rejectWith(new KeyNotFoundException('not found'));
    keystore.addKey.and.resolveTo();
    keystoreServiceSpy.findAllKeystores.and.resolveTo([keystore]);
    encryptionServiceSpy.generateNewKey.and.returnValue('newKey');

    expect(await service.getOrCreateKey('nonExistent.com')).toBe('newKey');
  });

  it('getOrCreateFolderKeystore with existing keystore returns keystore', async () => {
    const folderKeystoreSpy = createFolderKeystoreSpy();
    folderKeystoreSpy.getFolderUrl.and.returnValue('example.org/folder/');
    folderKeystoreSpy.getStorageUrl.and.returnValue('example.org/keystore');
    folderKeystoreSpy.getStorage.and.returnValue(storage);
    storage.getEncryptionKey.and.returnValue('key');
    keystoreServiceSpy.findAllKeystores.and.resolveTo([folderKeystoreSpy]);

    expect(
      await service.getOrCreateFolderKeystore('example.org/folder/')
    ).toEqual({
      keystoreUrl: 'example.org/keystore',
      encryptionKey: 'key',
    });
  });

  it('getOrCreateFolderKeystore with not existing keystore returns new keystore', async () => {
    const folderKeystoreSpy = createFolderKeystoreSpy();
    folderKeystoreSpy.getFolderUrl.and.returnValue('example.org/folder/');
    folderKeystoreSpy.getStorageUrl.and.returnValue('example.org/keystore');
    folderKeystoreSpy.getStorage.and.returnValue(storage);
    folderKeystoreSpy.getKeysAll.and.resolveTo({});
    storage.getEncryptionKey.and.returnValue('key');

    keystoreServiceSpy.findAllKeystores.and.resolveTo([]);
    keystoreServiceSpy.getKeystores.and.resolveTo([folderKeystoreSpy]);
    keystoreServiceSpy.createEmptyFolderKeystore
      .withArgs('example.org/folder/')
      .and.resolveTo(folderKeystoreSpy);

    await service.getOrCreateFolderKeystore('example.org/folder/');

    expect(
      await keystoreServiceSpy.createEmptyFolderKeystore
    ).toHaveBeenCalledWith('example.org/folder/');
  });
});
