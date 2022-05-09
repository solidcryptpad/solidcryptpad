import { TestBed } from '@angular/core/testing';

import { SolidFileHandlerService } from './solid-file-handler.service';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';

describe('SolidFileHandlerService', () => {
  let service: SolidFileHandlerService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'readAndDecryptFile',
      'writeAndEncryptFile',
    ]);

    TestBed.configureTestingModule({
      providers: [
        SolidFileHandlerService,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    });
    service = TestBed.inject(SolidFileHandlerService);

    // eslint-disable-next-line unused-imports/no-unused-vars
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
