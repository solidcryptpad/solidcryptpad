import { TestBed } from '@angular/core/testing';

import { SharedByMeService } from './shared-by-me.service';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { FileEncryptionService } from '../encryption/file-encryption/file-encryption.service';
import { SolidFileHandlerService } from '../file-handler/solid-file-handler.service';

describe('SharedByMeService', () => {
  let service: SharedByMeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: SolidAuthenticationService, useValue: {} },
        { provide: FileEncryptionService, useValue: {} },
        { provide: SolidFileHandlerService, useValue: {} },
      ],
    });
    service = TestBed.inject(SharedByMeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
