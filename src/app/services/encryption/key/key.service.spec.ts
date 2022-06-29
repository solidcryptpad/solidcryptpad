import { TestBed } from '@angular/core/testing';
import { EncryptionService } from '../encryption/encryption.service';
import { KeystoreService } from '../keystore/keystore.service';

import { KeyService } from './key.service';

describe('KeyService', () => {
  let service: KeyService;
  let keystoreServiceSpy: jasmine.SpyObj<KeystoreService>;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;

  beforeEach(() => {
    const keystoreSpy = jasmine.createSpyObj('KeystoreService', [
      'findAllKeystores',
    ]);
    const encryptionSpy = jasmine.createSpyObj('EncryptionService', [
      'generateNewKey',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: KeystoreService, useValue: keystoreSpy },
        { provide: EncryptionService, useValue: encryptionSpy },
      ],
    });

    service = TestBed.inject(KeyService);
    // eslint-disable-next-line unused-imports/no-unused-vars
    keystoreServiceSpy = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
    // eslint-disable-next-line unused-imports/no-unused-vars
    encryptionServiceSpy = TestBed.inject(
      EncryptionService
    ) as jasmine.SpyObj<EncryptionService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
