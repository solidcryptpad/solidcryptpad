import { TestBed } from '@angular/core/testing';
import { KeystoreService } from '../keystore/keystore.service';

import { FileEncryptionService } from './file-encryption.service';

describe('FileEncryptionService', () => {
  let service: FileEncryptionService;
  let keystoreServiceSpy: jasmine.SpyObj<KeystoreService>;

  beforeEach(() => {
    const keystoreSpy = jasmine.createSpyObj('KeystoreService', [
      'getKey',
      'storeKey',
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: KeystoreService, useValue: keystoreSpy }],
    });
    service = TestBed.inject(FileEncryptionService);

    // eslint-disable-next-line unused-imports/no-unused-vars
    keystoreServiceSpy = TestBed.inject(
      KeystoreService
    ) as jasmine.SpyObj<KeystoreService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
