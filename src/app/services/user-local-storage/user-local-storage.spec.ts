import { TestBed } from '@angular/core/testing';

import { UserLocalStorage } from './user-local-storage.service';

describe('LocalStorageServiceService', () => {
  let service: UserLocalStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserLocalStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
