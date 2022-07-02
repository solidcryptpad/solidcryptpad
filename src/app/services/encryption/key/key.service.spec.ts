import { TestBed } from '@angular/core/testing';
import { EncryptionService } from '../encryption/encryption.service';
import { KeystoreService } from '../keystore/keystore.service';

import { KeyService } from './key.service';
import { SharedFileKeystore } from '../keystore/shared-file-keystore.class';
import { Keystore, SecureRemoteStorage } from '../keystore/keystore.interface';
import { SharedFolderKeystore } from '../keystore/shared-folder-keystore.class';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';

describe('KeyService', () => {
  let service: KeyService;
  let keystoreServiceSpy: jasmine.SpyObj<KeystoreService>;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;
  let keystores: Keystore[];
  let storage: jasmine.SpyObj<SecureRemoteStorage>;

  beforeEach(() => {
    const authenticationSpyObj = jasmine.createSpyObj(
      'SolidAuthenticationSpy',
      ['writeKeystoreToPod', 'loadKeystore']
    );

    const keystoreSpy = jasmine.createSpyObj('KeystoreService', [
      'findAllKeystores',
      'getKey',
      'createEmptySharedFolderKeystore',
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
    // eslint-disable-next-line unused-imports/no-unused-vars
    keystoreServiceSpy = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    encryptionServiceSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;
  });

  it('should be created', async () => {
    expect(service).toBeTruthy();
  });

  it('getKey returns correct key', async () => {
    const ks = new SharedFileKeystore(storage, 'keystore.url');

    ks['keys'] = {
      ['example.com']: 'the key',
      ['different.com']: 'the other key',
    };

    keystores = [ks];

    keystoreServiceSpy.findAllKeystores.and.resolveTo(keystores);

    expect(await service.getKey('example.com')).toBe('the key');
    expect(await service.getKey('different.com')).toBe('the other key');
  });

  it('getOrCreateKey creates new key', async () => {
    const ks = new SharedFileKeystore(storage, 'keystore.url');
    spyOn(ks, 'addKey').and.resolveTo();

    keystores = [ks];

    keystoreServiceSpy.findAllKeystores.and.resolveTo(keystores);
    encryptionServiceSpy.generateNewKey.and.returnValue('newKey');
    expect(await service.getOrCreateKey('nonExistent.com')).toBe('newKey');
  });

  it('getOrCreateSharedFolderKeystore with existing keystore returns keystore', async () => {
    const ks = new SharedFolderKeystore('keystore.url', 'root', storage);
    keystores = [ks];
    keystoreServiceSpy.findAllKeystores.and.resolveTo(keystores);

    spyOn(ks, 'getStorageUrl').and.returnValue('storage.url');
    spyOn(ks, 'getStorage').and.returnValue(storage);

    storage.getEncryptionKey.and.returnValue('key');

    expect(await service.getOrCreateSharedFolderKeystore('root')).toEqual({
      keystoreUrl: 'storage.url',
      encryptionKey: 'key',
    });
  });

  it('getOrCreateSharedFolderKeystore with not existing keystore returns new keystore', async () => {
    const ks = new SharedFolderKeystore('keystore.url', 'root', storage);

    storage.loadSecure.and.resolveTo('{}');

    keystoreServiceSpy.findAllKeystores.and.resolveTo([]);
    keystoreServiceSpy.getKeystores.and.resolveTo([ks]);

    spyOn(ks, 'getStorageUrl').and.returnValue(ks.getStorageUrl());
    spyOn(ks, 'getStorage').and.returnValue(storage);
    storage.getEncryptionKey.and.returnValue('key');

    keystoreServiceSpy.createEmptySharedFolderKeystore
      .withArgs('root')
      .and.resolveTo(ks);

    await service.getOrCreateSharedFolderKeystore('root');

    expect(
      await keystoreServiceSpy.createEmptySharedFolderKeystore
    ).toHaveBeenCalledWith('root');
  });
});
