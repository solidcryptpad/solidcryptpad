import { TestBed } from '@angular/core/testing';
import { NotACryptpadUrlException } from 'src/app/exceptions/not-a-cryptpad-url-exception';
import { DirectoryStructureService } from '../../directory-structure/directory-structure.service';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';
import { EncryptionService } from '../encryption/encryption.service';
import { KeyService } from '../key/key.service';

import { FileEncryptionService } from './file-encryption.service';

describe('FileEncryptionService', () => {
  let service: FileEncryptionService;
  let keyServiceSpy: jasmine.SpyObj<KeyService>;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;
  let fileServiceSpy: jasmine.SpyObj<SolidFileHandlerService>;
  let directoryServiceSpy: jasmine.SpyObj<DirectoryStructureService>;

  const sampleTurtleBlob = new Blob(["I'm a turtle"], { type: 'text/turtle' });
  const sampleEncryptedBlob = new Blob(["I'm a ciphertext"], {
    type: 'text/plain',
  });
  const sampleCiphertext = "I'm a ciphertext";
  const sampleFileUrl = 'https://example.org/solidcryptpad/file.txt';

  beforeEach(() => {
    const keySpy = jasmine.createSpyObj('KeyService', [
      'getKey',
      'getOrCreateKey',
    ]);
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', [
      'encryptBlob',
      'decryptAsBlob',
    ]);
    const fileSpy = jasmine.createSpyObj('FileService', [
      'writeFile',
      'readFile',
      'isContainer',
    ]);
    const directorySpy = jasmine.createSpyObj('DirectoryStructureService', [
      'isInEncryptedDirectory',
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: KeyService, useValue: keySpy },
        { provide: EncryptionService, useValue: encryptionSpy },
        {
          provide: SolidFileHandlerService,
          useValue: fileSpy,
        },
        { provide: DirectoryStructureService, useValue: directorySpy },
      ],
    });
    service = TestBed.inject(FileEncryptionService);

    keyServiceSpy = TestBed.inject(KeyService) as jasmine.SpyObj<KeyService>;
    encryptionServiceSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;
    fileServiceSpy = TestBed.inject(
      SolidFileHandlerService
    ) as jasmine.SpyObj<SolidFileHandlerService>;
    directoryServiceSpy = TestBed.inject(
      DirectoryStructureService
    ) as jasmine.SpyObj<DirectoryStructureService>;

    fileServiceSpy.isContainer.and.returnValue(false);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('encryptFile encrypts blob with key from keystore', async () => {
    keyServiceSpy.getOrCreateKey.and.resolveTo('the key');
    encryptionServiceSpy.encryptBlob.and.resolveTo(sampleCiphertext);
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(true);

    const encryptedBlob = await service.encryptFile(
      sampleTurtleBlob,
      sampleFileUrl
    );

    expect(keyServiceSpy.getOrCreateKey).toHaveBeenCalledWith(sampleFileUrl);
    expect(encryptionServiceSpy.encryptBlob).toHaveBeenCalledWith(
      sampleTurtleBlob,
      'the key'
    );
    expect(encryptedBlob).toEqual(
      new Blob([sampleCiphertext], { type: 'text/plain' })
    );
  });

  it('decryptFile gets key and calls decryptFileWithKey', async () => {
    keyServiceSpy.getKey.and.resolveTo('the key');
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(true);
    const decryptFileWithKeySpy = spyOn(service, 'decryptFileWithKey');

    await service.decryptFile(sampleEncryptedBlob, sampleFileUrl);

    expect(keyServiceSpy.getKey).toHaveBeenCalledWith(sampleFileUrl);
    expect(decryptFileWithKeySpy).toHaveBeenCalledWith(
      sampleEncryptedBlob,
      'the key'
    );
  });

  it('decryptFileWithKey decrypts blob', async () => {
    encryptionServiceSpy.decryptAsBlob.and.resolveTo(sampleTurtleBlob);
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(true);

    const blob = await service.decryptFileWithKey(
      new Blob(['ciphertext']),
      'the key'
    );

    expect(encryptionServiceSpy.decryptAsBlob).toHaveBeenCalledWith(
      'ciphertext',
      'the key'
    );
    expect(blob).toEqual(sampleTurtleBlob);
  });

  it('readAndDecryptFile calls decryptFile with returned file', async () => {
    const url = 'https://example.com/solidcryptpad/test';
    fileServiceSpy.readFile.and.resolveTo(sampleEncryptedBlob);
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(true);
    const decryptFileSpy = spyOn(service, 'decryptFile').and.resolveTo(
      sampleTurtleBlob
    );

    await expectAsync(service.readAndDecryptFile(url))
      .withContext('file was not decrypted')
      .toBeResolvedTo(sampleTurtleBlob);

    expect(fileServiceSpy.readFile).toHaveBeenCalledWith(url);
    expect(decryptFileSpy).toHaveBeenCalledWith(sampleEncryptedBlob, url);
  });

  it('readAndDecryptFileWithKey calls decryptFileWithKey with returned file', async () => {
    fileServiceSpy.readFile.and.resolveTo(sampleTurtleBlob);
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(true);
    const decryptFileWithKeySpy = spyOn(service, 'decryptFileWithKey');

    await service.readAndDecryptFileWithKey(sampleFileUrl, 'the key');

    expect(decryptFileWithKeySpy).toHaveBeenCalledWith(
      sampleTurtleBlob,
      'the key'
    );
  });

  it('readAndDecryptFileWithKey throws exception if not in encrypted directory', async () => {
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(false);
    const url = 'https://example.org/test/';

    await expectAsync(
      service.readAndDecryptFileWithKey(url, 'the key')
    ).toBeRejectedWithError(NotACryptpadUrlException);
  });

  it('writeAndEncryptFile calls writeFile and encryptFile', async () => {
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(true);
    const url = 'https://example.com/solidcryptpad/test';
    const file = new Blob(['file']);
    const encryptedFile = new Blob(['encrypted file']);
    fileServiceSpy.writeFile.and.resolveTo();
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(true);
    const encryptFileSpy = spyOn(service, 'encryptFile').and.resolveTo(
      encryptedFile
    );

    await expectAsync(service.writeAndEncryptFile(file, url)).toBeResolved();

    expect(fileServiceSpy.writeFile).toHaveBeenCalledWith(encryptedFile, url);
    expect(encryptFileSpy).toHaveBeenCalledWith(file, url);
  });

  it('writeAndEncryptFile throws exception if not in encrypted directory', async () => {
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(false);
    const url = 'https://example.com/test';

    await expectAsync(
      service.writeAndEncryptFile(new Blob(['file']), url)
    ).toBeRejectedWithError(NotACryptpadUrlException);
  });

  it('readAndDecryptFile throws exception if not in encrypted directory', async () => {
    directoryServiceSpy.isInEncryptedDirectory.and.returnValue(false);
    const url = 'https://example.com/test';

    await expectAsync(service.readAndDecryptFile(url)).toBeRejectedWithError(
      NotACryptpadUrlException
    );
  });
});
