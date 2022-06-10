import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';

import { KeystoreService } from './keystore.service';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { UserLocalStorage } from '../user-local-storage/user-local-storage.service';

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

  it('should create unique keys', () => {
    const key1 = service.generateNewKey();
    const key2 = service.generateNewKey();
    expect(key1).not.toBe(key2);
  });

  it('should set master password', async () => {
    service.setMasterPassword('testpwd');
    expect(await service.getMasterPassword()).not.toEqual('');
  });

  it('should hash master password', async () => {
    service.setMasterPassword('testpwd');
    expect(await service.getMasterPassword()).not.toEqual('testpwd');
  });

  it('should load keystore from localstorage', () => {
    const key = service.generateNewKey();
    const id = 'testURL/test';
    const keystore = [{ ID: id, KEY: key }];
    userLocalStorage.setItem('keystore', JSON.stringify(keystore));
    expect(service.getLocalKeystore()).toEqual(keystore);
  });

  it('should find key in localstorage', () => {
    const key = service.generateNewKey();
    const id = 'testURL/test';
    const keystore = [{ ID: id, KEY: key }];
    userLocalStorage.setItem('keystore', JSON.stringify(keystore));
    expect(service.getKeyFromLocalKeystore(id)).toBe(key);
  });
});
