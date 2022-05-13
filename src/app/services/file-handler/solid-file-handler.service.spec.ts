import { TestBed } from '@angular/core/testing';

import { SolidFileHandlerService } from './solid-file-handler.service';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import {
  FetchError,
  mockContainerFrom,
  mockFileFrom,
  WithResourceInfo,
} from '@inrupt/solid-client';
import { PermissionException } from 'src/app/exceptions/permission-exception';
import { KeystoreService } from '../keystore/keystore.service';
import { AlreadyExistsException } from 'src/app/exceptions/already-exists-exception';
import { UnknownException } from 'src/app/exceptions/unknown-exception';
import { BaseException } from 'src/app/exceptions/base-exception';

describe('SolidFileHandlerService', () => {
  let service: SolidFileHandlerService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let solidClientServiceSpy: jasmine.SpyObj<SolidClientService>;
  let keyStoreServiceSpy: jasmine.SpyObj<KeystoreService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'readAndDecryptFile',
      'writeAndEncryptFile',
    ]);
    const solidClientSpy = jasmine.createSpyObj('SolidClientService', [
      'getFile',
      'overwriteFile',
      'isContainer',
      'createContainerAt',
      'getSolidDataset',
      'getContainedResourceUrlAll',
    ]);
    const keyStoreSpy = jasmine.createSpyObj('KeystoreService', [
      'decryptFile',
      'setMasterPassword',
      'encryptFile',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SolidFileHandlerService,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        { provide: SolidClientService, useValue: solidClientSpy },
        { provide: KeystoreService, useValue: keyStoreSpy },
      ],
    });
    service = TestBed.inject(SolidFileHandlerService);

    // eslint-disable-next-line unused-imports/no-unused-vars
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
    console.log(authenticationServiceSpy); //Temp. Fix for lint error 'authenticationServiceSpy' is assigned a value but never used'

    solidClientServiceSpy = TestBed.inject(
      SolidClientService
    ) as jasmine.SpyObj<SolidClientService>;

    keyStoreServiceSpy = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('readFile throws NotFoundException on 404', async () => {
    const url = 'https://real.url.com';

    solidClientServiceSpy.getFile.and.throwError(createFetchMock(url, 404));

    await expectAsync(service.readFile(url)).toBeRejectedWithError(
      NotFoundException
    );
  });

  it('readFile throws PermissionException on 401', async () => {
    const url = 'https://real.url.com';

    solidClientServiceSpy.getFile.and.throwError(createFetchMock(url, 401));

    await expectAsync(service.readFile(url)).toBeRejectedWithError(
      PermissionException
    );
  });

  it('readFile throws PermissionException on 403', async () => {
    const url = 'https://real.url.com';

    solidClientServiceSpy.getFile.and.throwError(createFetchMock(url, 403));

    await expectAsync(service.readFile(url)).toBeRejectedWithError(
      PermissionException
    );
  });

  it('readFile returns blob', async () => {
    const url = 'https://real.url.com';

    const file = mockFileFrom(url);
    solidClientServiceSpy.getFile.and.returnValue(Promise.resolve(file));

    await expectAsync(service.readFile(url)).toBeResolvedTo(file);
  });

  it('readFile calls convertError on error', async () => {
    const url = 'https://real.url.com';
    solidClientServiceSpy.getFile.and.throwError(new Error());

    spyOn(service, 'convertError');

    await service.readFile(url);

    expect(service.convertError).toHaveBeenCalled();
  });

  it('readAndDecryptFile calls decryptFile with returned file', async () => {
    const url = 'https://real.url.com';
    const file = mockFileFrom(url);
    const decryptedFile = new Blob(['decrypted File']);

    solidClientServiceSpy.getFile.and.returnValue(Promise.resolve(file));
    keyStoreServiceSpy.decryptFile.and.returnValue(
      Promise.resolve(decryptedFile)
    );

    await expectAsync(service.readAndDecryptFile(url))
      .withContext('file was not decrypted')
      .toBeResolvedTo(decryptedFile);

    expect(solidClientServiceSpy.getFile).toHaveBeenCalled();
    expect(keyStoreServiceSpy.decryptFile).toHaveBeenCalled();
  });

  it('writeFile calls overwriteFile', async () => {
    const url = 'https://real.url.com';
    const blob = new Blob(['blob']) as Blob & WithResourceInfo;

    solidClientServiceSpy.overwriteFile.and.returnValue(Promise.resolve(blob));

    await expectAsync(service.writeFile(blob, url)).toBeResolvedTo(blob);

    expect(solidClientServiceSpy.overwriteFile).toHaveBeenCalled();
  });

  it('writeFile appends fileName if path is container', async () => {
    const url = 'https://real.url.com/';
    const blob = new Blob(['blob']) as Blob & WithResourceInfo;

    solidClientServiceSpy.overwriteFile.and.returnValue(Promise.resolve(blob));
    solidClientServiceSpy.isContainer.and.returnValue(true);

    await service.writeFile(blob, url, 'name');

    expect(solidClientServiceSpy.overwriteFile).toHaveBeenCalledWith(
      url + 'name',
      blob,
      jasmine.anything()
    );
  });

  it('writeFile calls convertError on error', async () => {
    const url = 'https://real.url.com';
    const file = new Blob(['blob']);

    solidClientServiceSpy.overwriteFile.and.throwError(new Error());

    spyOn(service, 'convertError');

    await service.writeFile(file, url);

    expect(service.convertError).toHaveBeenCalled();
  });

  it('writeAndEncryptFile calls writeFile and encryptFile', async () => {
    const url = 'https://real.url.com';
    const file = mockFileFrom(url);
    const encryptedFile = new Blob(['encryptedFile File']);

    solidClientServiceSpy.overwriteFile.and.returnValue(Promise.resolve(file));
    keyStoreServiceSpy.encryptFile.and.returnValue(
      Promise.resolve(encryptedFile)
    );

    await service.writeAndEncryptFile(file, url);

    expect(solidClientServiceSpy.overwriteFile).toHaveBeenCalled();
    expect(keyStoreServiceSpy.encryptFile).toHaveBeenCalledWith(
      file,
      jasmine.anything()
    );
  });

  it('convertError converts 404 to NotFoundException', () => {
    const url = 'https://real.url.com';

    expect(() => service.convertError(createFetchMock(url, 404))).toThrowError(
      NotFoundException
    );
  });

  it('convertError converts 401 to PermissionException', () => {
    const url = 'https://real.url.com';

    expect(() => service.convertError(createFetchMock(url, 401))).toThrowError(
      PermissionException
    );
  });

  it('convertError converts 403 to PermissionException', () => {
    const url = 'https://real.url.com';

    expect(() => service.convertError(createFetchMock(url, 403))).toThrowError(
      PermissionException
    );
  });

  it('convertError converts 405 to AlreadyExistsException', () => {
    const url = 'https://real.url.com';

    expect(() => service.convertError(createFetchMock(url, 405))).toThrowError(
      AlreadyExistsException
    );
  });

  it('convertError converts non baseexception to UnknownException', () => {
    expect(() => service.convertError(new Error(''))).toThrowError(
      UnknownException
    );
  });

  it('convertError throws baseException', () => {
    const exception = new BaseException('BaseException', 'message');
    expect(() => service.convertError(exception)).toThrowError(
      BaseException,
      exception.message
    );
  });

  it('isContainer calls SolidClientService::isContainer', () => {
    service.isContainer('https://real.url.com');

    expect(solidClientServiceSpy.isContainer).toHaveBeenCalled();
  });

  it('writeContainer appends / if path is not a folder', async () => {
    const url = 'https://real.url.com/newFolder';
    const container = mockContainerFrom(url + '/');

    solidClientServiceSpy.createContainerAt.and.returnValue(
      Promise.resolve(container)
    );

    solidClientServiceSpy.isContainer.and.returnValue(false);

    await service.writeContainer(url);

    expect(solidClientServiceSpy.createContainerAt).toHaveBeenCalledWith(
      url + '/'
    );
  });

  it('writeContainer calls convertError on error', async () => {
    const url = 'https://real.url.com';

    solidClientServiceSpy.createContainerAt.and.throwError(new Error());

    spyOn(service, 'convertError');

    await service.writeContainer(url);

    expect(service.convertError).toHaveBeenCalled();
  });

  it('writeContainer calls createContainerAt', async () => {
    const url = 'https://real.url.com';
    await service.writeContainer(url);

    expect(solidClientServiceSpy.createContainerAt).toHaveBeenCalled();
  });

  it('getContainer calls convertError on error', async () => {
    const url = 'https://real.url.com';

    solidClientServiceSpy.getSolidDataset.and.throwError(new Error());

    spyOn(service, 'convertError');

    await service.getContainer(url);

    expect(service.convertError).toHaveBeenCalled();
  });

  it('getContainer calls getSolidDataset', async () => {
    const url = 'https://real.url.com';
    await service.getContainer(url);
    expect(solidClientServiceSpy.getSolidDataset).toHaveBeenCalled();
  });

  it('getContainerContent calls convertError on error', async () => {
    const url = 'https://real.url.com';

    solidClientServiceSpy.getContainedResourceUrlAll.and.throwError(
      new Error()
    );

    spyOn(service, 'convertError');

    await service.getContainerContent(url);

    expect(service.convertError).toHaveBeenCalled();
  });

  it('getContainerContent calls getContainer and getContainedResourceUrlAll', async () => {
    const url = 'https://real.url.com/';
    spyOn(service, 'getContainer');

    await service.getContainerContent(url);

    expect(service.getContainer).toHaveBeenCalled();

    expect(solidClientServiceSpy.getContainedResourceUrlAll).toHaveBeenCalled();
  });
  //todo getcontainercontent
  //todo check call for convertError
});

/**
 * function that creates a mock fetch request
 * function was copied from: https://github.com/inrupt/solid-client-js/blob/4b996001/src/resource/mock.ts#L51 and is contained in the library
 * but the library seems to not load it correctly
 */
function createFetchMock(url: string, status = 404): FetchError {
  const failedResponse = new Response(undefined, {
    status: status,
  }) as Response & { ok: false };

  return new FetchError('', failedResponse);
}
