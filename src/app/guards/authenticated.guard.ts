import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { SolidAuthenticationService } from '../services/solid-authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticatedGuard implements CanActivate {
  constructor(private solidAuthenticationService: SolidAuthenticationService) {}
  async canActivate() {
    await this.solidAuthenticationService.waitForSessionRestore();
    if (this.solidAuthenticationService.isLoggedIn()) {
      return true;
    }
    // TODO: consider passing redirect url
    this.solidAuthenticationService.goToLoginPage();
    return false;
  }
}
