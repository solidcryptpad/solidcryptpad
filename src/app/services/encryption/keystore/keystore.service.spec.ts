import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../../authentication/solid-authentication.service';

import { KeystoreService } from './keystore.service';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

describe('KeystoreService', () => {
  let service: KeystoreService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'writeKeystoreToPod',
      'loadKeystore',
    ]);

    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
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

  it('should set master password', async () => {
    service.setMasterPassword('testpwd');
    expect(await service.getMasterPassword()).not.toEqual('');
  });

  it('should hash master password', async () => {
    service.setMasterPassword('testpwd');
    expect(await service.getMasterPassword()).not.toEqual('testpwd');
  });

  it('should load keystore from localstorage', () => {
    const key = 'somekey';
    const id = 'testURL/test';
    const keystore = [{ ID: id, KEY: key }];
    localStorage.setItem('keystore', JSON.stringify(keystore));
    expect(service.getLocalKeystore()).toEqual(keystore);
  });

  it('should find key in localstorage', () => {
    const key = 'somekey';
    const id = 'testURL/test';
    const keystore = [{ ID: id, KEY: key }];
    localStorage.setItem('keystore', JSON.stringify(keystore));
    expect(service.getKeyFromLocalKeystore(id)).toBe(key);
  });
});
