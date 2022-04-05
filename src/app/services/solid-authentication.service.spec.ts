import { TestBed } from '@angular/core/testing';

import { SolidAuthenticationService } from './solid-authentication.service';

describe('SolidAuthenticationService', () => {
  let service: SolidAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
