import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../services/solid-authentication.service';

import { AuthenticatedGuard } from './authenticated.guard';

describe('AuthenticatedGuard', () => {
  let guard: AuthenticatedGuard;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['isLoggedIn']
    );
    TestBed.configureTestingModule({
      providers: [
        AuthenticatedGuard,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    });
    guard = TestBed.inject(AuthenticatedGuard);
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if logged in', () => {
    authenticationServiceSpy.isLoggedIn.and.returnValue(true);
    expect(guard.canActivate()).toBeTrue();
  });

  it('should return false if logged out', () => {
    authenticationServiceSpy.isLoggedIn.and.returnValue(false);
    expect(guard.canActivate()).toBeFalse();
  });
});
