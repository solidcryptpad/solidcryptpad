import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';

import { KeystoreService } from './keystore.service';

describe('KeystoreService', () => {
  let service: KeystoreService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'writeKeystoreToPod',
      'loadKeystore',
    ]);

    TestBed.configureTestingModule({
      providers: [
        KeystoreService,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    });

    service = TestBed.inject(KeystoreService);

    // eslint-disable-next-line unused-imports/no-unused-vars
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
