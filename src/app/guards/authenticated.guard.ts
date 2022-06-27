import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SolidAuthenticationService } from '../services/authentication/solid-authentication.service';
import { Observable, tap } from 'rxjs';
import { RedirectService } from '../services/redirect/redirect.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private solidAuthenticationService: SolidAuthenticationService,
    private router: Router,
    private redirectService: RedirectService
  ) {}

  canActivate(): Observable<boolean> {
    return this.solidAuthenticationService
      .isLoggedIn()
      .pipe(tap((el) => this.redirect(el)));
  }

  redirect(isLoggedIn: boolean) {
    if (!isLoggedIn) {
      this.redirectService.setRedirect(window.location.href);
      this.router.navigate(['/']);
    }
  }
}
