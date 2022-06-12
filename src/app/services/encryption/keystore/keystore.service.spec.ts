import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';

import { KeystoreService } from './keystore.service';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UserLocalStorage } from '../../user-local-storage/user-local-storage.service';

describe('KeystoreService', () => {
  let service: KeystoreService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let userLocalStorage: UserLocalStorage;
  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'writeKeystoreToPod',
      'loadKeystore',
    ]);

    userLocalStorage = new UserLocalStorage();

    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        KeystoreService,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        { provide: UserLocalStorage, userValue: userLocalStorage },
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
