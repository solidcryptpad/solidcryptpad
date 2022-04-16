import { TestBed } from '@angular/core/testing';

import { SolidFileHandlerService } from './solid-file-handler.service';

describe('SolidFileHandlerService', () => {
  let service: SolidFileHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidFileHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
