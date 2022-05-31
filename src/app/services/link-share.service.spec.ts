import { TestBed } from '@angular/core/testing';

import { LinkShareService } from './link-share.service';

describe('LinkShareService', () => {
  let service: LinkShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
