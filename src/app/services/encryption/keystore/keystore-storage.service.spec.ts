import { TestBed } from '@angular/core/testing';
import { SolidFileHandlerService } from '../../file-handler/solid-file-handler.service';

import { KeystoreStorageService } from './keystore-storage.service';

describe('KeystoreStorageService', () => {
  let service: KeystoreStorageService;

  beforeEach(() => {
    const fileSpy = jasmine.createSpyObj('FileService', [
      'readFile',
      'writeFile',
    ]);

    TestBed.configureTestingModule({
      providers: [{ provide: SolidFileHandlerService, useValue: fileSpy }],
    });
    service = TestBed.inject(KeystoreStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
