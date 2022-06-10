import { TestBed } from '@angular/core/testing';

import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create unique keys', () => {
    const key1 = service.generateNewKey();
    const key2 = service.generateNewKey();
    expect(key1).not.toBe(key2);
  });
});
