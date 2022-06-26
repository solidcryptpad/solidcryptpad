import { TestBed } from '@angular/core/testing';

import { SharedByMeService } from './shared-by-me.service';

describe('SharedByMeService', () => {
  let service: SharedByMeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedByMeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
