import { TestBed } from '@angular/core/testing';

import { SolidClientService } from './solid-client.service';

describe('SolidClientService', () => {
  let service: SolidClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
