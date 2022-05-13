import { TestBed } from '@angular/core/testing';

import { SolidFileHandlerService } from './solid-file-handler.service';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { NotFoundException } from 'src/app/exceptions/not-found-exception';
import { mockFetchError } from '@inrupt/solid-client';

describe('SolidFileHandlerService', () => {
  let service: SolidFileHandlerService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let solidClientServiceSpy: jasmine.SpyObj<SolidClientService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'readAndDecryptFile',
      'writeAndEncryptFile',
    ]);
    const solidClientSpy = jasmine.createSpyObj('SolidClientService', [
      'getFile',
      'overwriteFile',
      'isContainer',
      'getSolidDataset',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SolidFileHandlerService,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        { provide: SolidClientService, useValue: solidClientSpy },
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

    console.log(solidClientServiceSpy); //Temp. Fix for lint error 'solidClientServiceSpy' is assigned a value but never used'
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('readFile throws NotFoundException on 404', async () => {
    const url = 'https://real.url.com';
    const fetchError = mockFetchError(url, 404);

    solidClientServiceSpy.getFile.and.throwError(fetchError);

    await expectAsync(service.readFile(url)).toBeRejectedWithError(
      NotFoundException
    );
  });

  /*it('readFile throws PermissionException on 401', async () => {
    expect(() => true).toBe(false);
  });

  it('readFile throws PermissionException on 403', async () => {
    expect(() => true).toBe(false);
  });

  it('readFile returns blob', async () => {
    expect(() => true).toBe(false);
  });*/
});
