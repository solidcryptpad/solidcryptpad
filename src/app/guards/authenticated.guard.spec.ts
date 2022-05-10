import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../services/authentication/solid-authentication.service';

import { AuthenticatedGuard } from './authenticated.guard';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('AuthenticatedGuard', () => {
  let guard: AuthenticatedGuard;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let router: Router;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['isLoggedIn', 'goToLoginPage']
    );
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    });

    guard = TestBed.inject(AuthenticatedGuard);

    router = TestBed.inject(Router);

    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if logged in', () => {
    authenticationServiceSpy.isLoggedIn.and.returnValue(of(true));

    return guard.canActivate().subscribe((canActivate) => {
      expect(canActivate).toBeTrue();
    });
  });

  it('should go to login page if logged out', async () => {
    authenticationServiceSpy.isLoggedIn.and.returnValue(of(false));

    await guard.canActivate();
    expect(router.url).toBe('/');
  });
});
