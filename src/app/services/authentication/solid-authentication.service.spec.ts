import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SolidAuthenticationService } from './solid-authentication.service';

describe('SolidAuthenticationService', () => {
  let service: SolidAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
    });
    service = TestBed.inject(SolidAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
