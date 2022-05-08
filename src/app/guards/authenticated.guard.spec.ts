import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../services/authentication/solid-authentication.service';

import { AuthenticatedGuard } from './authenticated.guard';
import { of } from 'rxjs';

describe('AuthenticatedGuard', () => {
  let guard: AuthenticatedGuard;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['isLoggedIn', 'goToLoginPage']
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

  it('should return true if logged in', async () => {
    authenticationServiceSpy.isLoggedIn.and.returnValue(of(true));

    expect(await guard.canActivate()).toBeTrue();
  });

  it('should go to login page if logged out', async () => {
    authenticationServiceSpy.isLoggedIn.and.returnValue(of(false));

    await guard.canActivate();

    expect(authenticationServiceSpy.goToLoginPage).toHaveBeenCalled();
  });
});
