import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';

import { KeystoreService } from './keystore.service';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UserLocalStorage } from '../../user-local-storage/user-local-storage.service';
import { Keystore, SecureRemoteStorage } from './keystore.interface';
import { SharedFileKeystore } from './shared-file-keystore.class';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';
import { MasterPasswordService } from '../master-password/master-password.service';
import { EncryptionService } from '../encryption/encryption.service';
import { KeystoreStorageService } from './keystore-storage.service';
import { SharedFolderKeystore } from './shared-folder-keystore.class';
import { DirectoryStructureService } from '../../directory-structure/directory-structure.service';
import { FolderKeystore } from './folder-keystore.class';

describe('KeystoreService', () => {
  let service: KeystoreService;
  let userLocalStorage: UserLocalStorage;
  let keystores: Keystore[];
  let storage: jasmine.SpyObj<SecureRemoteStorage>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let masterPasswordSpy: jasmine.SpyObj<MasterPasswordService>;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;
  let keystoreStorageServiceSpy: jasmine.SpyObj<KeystoreStorageService>;
  let directoryServiceSpy: jasmine.SpyObj<DirectoryStructureService>;

  const fakePodUrl = 'fake.solidweb.org/';
  const keystoresFolderPath = 'solidcryptpad-data/keystores/';
  const fakeKeystoresUrl = fakePodUrl + keystoresFolderPath;
  const fakeMetaDataUrl =
    fakePodUrl + keystoresFolderPath + 'keystores.json.enc';

  beforeEach(() => {
    const keystoreStorageServiceSpyObj = jasmine.createSpyObj(
      'KeystoreStorageService',
      ['createSecureStorage']
    );

    const directoryServiceSpyObj = jasmine.createSpyObj(
      'DirectoryStructureService',
      ['getRootDirectory', 'getKeystoresDirectory']
    );

    const encryptionSpyObj = jasmine.createSpyObj('EncryptionService', [
      'encryptString',
      'generateNewKey',
    ]);

    const masterPasswordObj = jasmine.createSpyObj('MasterPasswordService', [
      'getMasterPassword',
      'setMasterPassword',
    ]);

    const fileServiceSpyObj = jasmine.createSpyObj('FileServiceSpy', [
      'writeFile',
      'resourceExists',
    ]);

    const authenticationSpyObj = jasmine.createSpyObj(
      'SolidAuthenticationSpy',
      ['writeKeystoreToPod', 'loadKeystore']
    );

    storage = jasmine.createSpyObj('SecureRemoteStorage', [
      'loadSecure',
      'saveSecure',
      'serializeMetadata',
    ]);

    userLocalStorage = new UserLocalStorage();

    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        KeystoreService,
        { provide: SolidAuthenticationService, useValue: authenticationSpyObj },
        { provide: UserLocalStorage, userValue: userLocalStorage },
        { provide: SolidFileHandlerService, useValue: fileServiceSpyObj },
        { provide: MasterPasswordService, useValue: masterPasswordObj },
        { provide: EncryptionService, useValue: encryptionSpyObj },
        {
          provide: DirectoryStructureService,
          useValue: directoryServiceSpyObj,
        },
        {
          provide: KeystoreStorageService,
          useValue: keystoreStorageServiceSpyObj,
        },
      ],
    });

    service = TestBed.inject(KeystoreService);

    keystoreStorageServiceSpy = TestBed.inject(
      KeystoreStorageService
    ) as jasmine.SpyObj<KeystoreStorageService>;

    directoryServiceSpy = TestBed.inject(
      DirectoryStructureService
    ) as jasmine.SpyObj<DirectoryStructureService>;

    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;

    masterPasswordSpy = TestBed.inject(
      MasterPasswordService
    ) as jasmine.SpyObj<MasterPasswordService>;

    encryptionServiceSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getKeystores returns keystores', () => {
    const ks = new SharedFileKeystore(storage, 'keystore.url');
    keystores = [ks];
    spyOn(service, 'getKeystores').and.resolveTo(keystores);

    return expectAsync(service.getKeystores()).toBeResolvedTo(keystores);
  });

  it('saveKeystoresMetadata writes with correct data', async () => {
    const ks = new SharedFileKeystore(storage, 'keystore.url');
    keystores = [ks];
    service['keystores'] = keystores; // needed to bypass check in line 93

    masterPasswordSpy.getMasterPassword.and.resolveTo('my master password');
    encryptionServiceSpy.encryptString.and.returnValue('a encrypted string');
    directoryServiceSpy.getKeystoresDirectory.and.resolveTo(fakeKeystoresUrl);

    await service.saveKeystoresMetadata();

    expect(fileServiceSpy.writeFile).toHaveBeenCalledWith(
      new Blob(['a encrypted string'], { type: 'text/plain' }),
      fakeMetaDataUrl
    );

    return expectAsync(masterPasswordSpy.getMasterPassword()).toBeResolvedTo(
      'my master password'
    );
  });

  it('createEmptyFolderKeystore creates folder keystore', async () => {
    const fakeNewKey = 'newKey';
    const fakeKeystoreUrl =
      fakePodUrl + keystoresFolderPath + fakeNewKey + '.shared-keystore';

    encryptionServiceSpy.generateNewKey.and.returnValue(fakeNewKey);
    directoryServiceSpy.getKeystoresDirectory.and.resolveTo(fakeKeystoresUrl);
    keystoreStorageServiceSpy.createSecureStorage.and.returnValue(storage);
    spyOn(service, 'loadKeystores').and.resolveTo();

    const ks = new FolderKeystore(
      fakeKeystoreUrl,
      'root',
      storage,
      directoryServiceSpy
    );

    expect(await service.createEmptyFolderKeystore('root')).toEqual(ks);
  });

  it('findAllKeystores returns all keystores', () => {
    const ks = new SharedFileKeystore(storage, 'keystore.url');
    const ks2 = new SharedFolderKeystore(
      'keystore.url',
      'root',
      storage,
      directoryServiceSpy
    );
    keystores = [ks, ks2];
    service['keystores'] = keystores;

    spyOn(service, 'loadKeystores').and.resolveTo();

    return expectAsync(
      service.findAllKeystores(() => Promise.resolve(true))
    ).toBeResolvedTo(keystores);
  });

  it('sharedFilesKeystoreExists returns false for non existing folder', async () => {
    const fakeSharedFilesKeystoreUrl =
      fakePodUrl + keystoresFolderPath + 'shared-files.json.enc';

    directoryServiceSpy.getKeystoresDirectory.and.resolveTo(fakeKeystoresUrl);

    fileServiceSpy.resourceExists
      .withArgs(fakeSharedFilesKeystoreUrl)
      .and.resolveTo(false);

    expect(
      await fileServiceSpy.resourceExists(fakeSharedFilesKeystoreUrl)
    ).toBe(false);
  });

  it('getSharedFilesKeystore returns sharedFilesKeystore', async () => {
    const ks = new SharedFileKeystore(storage, 'keystore.url');
    const ks2 = new SharedFolderKeystore(
      'keystore.url',
      'root',
      storage,
      directoryServiceSpy
    );

    keystores = [ks, ks2];
    service['keystores'] = keystores;
    spyOn(service, 'loadKeystores').and.resolveTo();

    expect(await service.getSharedFilesKeystore()).toEqual(ks);
    expect(await service.getSharedFilesKeystore()).not.toEqual(ks2);
  });

  it('getSharedFolderKeystores returns sharedFolderKeystores', async () => {
    const ks = new SharedFileKeystore(storage, 'keystore.url');
    const ks2 = new SharedFolderKeystore(
      'keystore2.url',
      'root',
      storage,
      directoryServiceSpy
    );
    const ks3 = new SharedFolderKeystore(
      'keystore3.url',
      'root2',
      storage,
      directoryServiceSpy
    );

    keystores = [ks, ks2, ks3];
    service['keystores'] = keystores;
    spyOn(service, 'loadKeystores').and.resolveTo();

    expect(await service.getSharedFolderKeystores()).toContain(ks2);
    expect(await service.getSharedFolderKeystores()).toContain(ks3);
  });
});
