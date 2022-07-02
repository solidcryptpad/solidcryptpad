import { TestBed } from '@angular/core/testing';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';
import { EncryptionService } from '../encryption/encryption.service';

import { KeystoreStorageService } from './keystore-storage.service';

describe('KeystoreStorageService', () => {
  let service: KeystoreStorageService;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;

  beforeEach(() => {
    const fileSpy = jasmine.createSpyObj('FileService', [
      'readFile',
      'writeFile',
    ]);
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', [
      'encryptString',
      'decryptString',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: SolidFileHandlerService, useValue: fileSpy },
        {
          provide: EncryptionService,
          useValue: encryptionSpy,
        },
      ],
    });

    service = TestBed.inject(KeystoreStorageService);
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    encryptionServiceSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates secure storage', () => {
    const storage = service.createSecureStorage('encryption key');
    expect(storage).toBeInstanceOf(Object);
  });

  it('loadSecure forwards to loadKeystore with url and encryptionKey', async () => {
    const storage = service.createSecureStorage('encryption key');
    const loadKeystoreSpy = spyOn<any>(service, 'loadKeystore');
    loadKeystoreSpy.and.resolveTo('keystore');

    const res = await storage.loadSecure('https://example.org');

    expect(loadKeystoreSpy).toHaveBeenCalledWith(
      'https://example.org',
      'encryption key'
    );
    expect(res).toBe('keystore');
  });

  it('saveSecure forwards to saveKeystore with url, data and encryptionKey', async () => {
    const storage = service.createSecureStorage('encryption key');
    const saveKeystoresMetadataSpy = spyOn<any>(service, 'saveKeystore');

    await storage.saveSecure('https://example.org', 'some data');

    expect(saveKeystoresMetadataSpy).toHaveBeenCalledOnceWith(
      'https://example.org',
      'some data',
      'encryption key'
    );
  });

  it('serialize stores the encryption key', () => {
    const storage = service.createSecureStorage('encryption key');

    const serialization = storage.serializeMetadata();

    expect(serialization).toContain('encryption key');
  });

  it('loadSecure after deserializing uses the encryption key', async () => {
    const originalStorage = service.createSecureStorage('encryption key');
    const loadKeystoreSpy = spyOn<any>(service, 'loadKeystore');
    loadKeystoreSpy.and.resolveTo('keystore');

    const newStorage = service.deserializeSecureStorage(
      originalStorage.serializeMetadata()
    );
    const res = await newStorage.loadSecure('https://example.org');

    expect(loadKeystoreSpy).toHaveBeenCalledWith(
      'https://example.org',
      'encryption key'
    );
    expect(res).toBe('keystore');
  });

  it('saveKeystore encrypts the data with the encryption key', async () => {
    encryptionServiceSpy.encryptString.and.returnValue('ciphertext');
    fileServiceSpy.writeFile.and.resolveTo();

    await service['saveKeystore'](
      'https://example.org',
      'some data',
      'encryption key'
    );

    expect(encryptionServiceSpy.encryptString).toHaveBeenCalledOnceWith(
      'some data',
      'encryption key'
    );
  });

  it('saveKeystore stores the encrypted data to the url', async () => {
    encryptionServiceSpy.encryptString.and.returnValue('ciphertext');
    fileServiceSpy.writeFile.and.resolveTo();

    await service['saveKeystore'](
      'https://example.org',
      'some data',
      'encryption key'
    );

    expect(fileServiceSpy.writeFile).toHaveBeenCalledOnceWith(
      new Blob(['ciphertext'], { type: 'text/plain' }),
      'https://example.org'
    );
  });

  it('loadKeystore reads the file from the url and converts it to text', async () => {
    const fakeBlob = jasmine.createSpyObj('Blob', ['text']);
    fakeBlob.text.and.resolveTo('ciphertext');
    encryptionServiceSpy.decryptString.and.returnValue('keystore');
    fileServiceSpy.readFile.and.resolveTo(fakeBlob);

    await service['loadKeystore']('https://example.org', 'encryption key');

    expect(fileServiceSpy.readFile).toHaveBeenCalledOnceWith(
      'https://example.org'
    );
    expect(fakeBlob.text).toHaveBeenCalled();
  });

  it('loadKeystore decrypts the data it received', async () => {
    const fakeBlob = jasmine.createSpyObj('Blob', ['text']);
    fakeBlob.text.and.resolveTo('ciphertext');
    encryptionServiceSpy.decryptString.and.returnValue('keystore');
    fileServiceSpy.readFile.and.resolveTo(fakeBlob);

    await service['loadKeystore']('https://example.org', 'encryption key');

    expect(encryptionServiceSpy.decryptString).toHaveBeenCalledOnceWith(
      'ciphertext',
      'encryption key'
    );
  });
});
