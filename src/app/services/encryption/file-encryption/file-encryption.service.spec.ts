import { TestBed } from '@angular/core/testing';
import { NotACryptpadUrlException } from 'src/app/exceptions/not-a-cryptpad-url-exception';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';
import { KeystoreService } from '../keystore/keystore.service';

import { FileEncryptionService } from './file-encryption.service';

describe('FileEncryptionService', () => {
  let service: FileEncryptionService;
  let keystoreServiceSpy: jasmine.SpyObj<KeystoreService>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;

  beforeEach(() => {
    const keystoreSpy = jasmine.createSpyObj('KeystoreService', [
      'getKey',
      'storeKey',
    ]);
    const fileSpy = jasmine.createSpyObj('FileService', [
      'writeFile',
      'readFile',
      'isContainer',
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: KeystoreService, useValue: keystoreSpy },
        {
          provide: SolidFileHandlerService,
          useValue: fileSpy,
        },
      ],
    });
    service = TestBed.inject(FileEncryptionService);

    // eslint-disable-next-line unused-imports/no-unused-vars
    keystoreServiceSpy = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;

    fileServiceSpy.isContainer.and.returnValue(false);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('readAndDecryptFile calls decryptFile with returned file', async () => {
    const url = 'https://example.com/solidcryptpad/test';
    const encryptedFile = new Blob(['encrypted file']);
    const decryptedFile = new Blob(['decrypted File']);
    fileServiceSpy.readFile.and.resolveTo(encryptedFile);
    const decryptFileSpy = spyOn(service, 'decryptFile').and.resolveTo(
      decryptedFile
    );

    await expectAsync(service.readAndDecryptFile(url))
      .withContext('file was not decrypted')
      .toBeResolvedTo(decryptedFile);

    expect(fileServiceSpy.readFile).toHaveBeenCalledWith(url);
    expect(decryptFileSpy).toHaveBeenCalledWith(encryptedFile, url);
  });

  it('writeAndEncryptFile calls writeFile and encryptFile', async () => {
    const url = 'https://example.com/solidcryptpad/test';
    const file = new Blob(['file']);
    const encryptedFile = new Blob(['encrypted file']);
    fileServiceSpy.writeFile.and.resolveTo();
    const encryptFileSpy = spyOn(service, 'encryptFile').and.resolveTo(
      encryptedFile
    );

    await expectAsync(service.writeAndEncryptFile(file, url)).toBeResolved();

    expect(fileServiceSpy.writeFile).toHaveBeenCalledWith(encryptedFile, url);
    expect(encryptFileSpy).toHaveBeenCalledWith(file, url);
  });

  it('writeAndEncryptFile throws exception on url without solidcryptpad', async () => {
    const url = 'https://example.com/test';

    await expectAsync(
      service.writeAndEncryptFile(new Blob(['file']), url)
    ).toBeRejectedWithError(NotACryptpadUrlException);
  });

  it('readAndDecryptFile throws exception on url without solidcryptpad', async () => {
    const url = 'https://example.com/test';

    await expectAsync(service.readAndDecryptFile(url)).toBeRejectedWithError(
      NotACryptpadUrlException
    );
  });

  it('isCryptoDirectory returns false for non-crypto-directory', () => {
    const result = service.isCryptoDirectory('https://example.org/test/foo/');
    expect(result).toBeFalse();
  });

  it('isCryptoDirectory returns true for crypto-directory', () => {
    const result = service.isCryptoDirectory(
      'https://example.org/solidcryptpad/foo/'
    );
    expect(result).toBeTrue();
  });

  it('getDefaultCryptoDirectoryUrl append default crypto directory to baseUrl', () => {
    const cryptoDirectoryUrl = service.getDefaultCryptoDirectoryUrl(
      'https://example.org/test/'
    );
    expect(cryptoDirectoryUrl).toBe('https://example.org/test/solidcryptpad/');
  });
});
