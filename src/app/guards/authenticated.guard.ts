import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { SolidAuthenticationService } from '../services/solid-authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticatedGuard implements CanActivate {
  constructor(private solidAuthenticationService: SolidAuthenticationService) {}
  async canActivate() {
    if (await this.solidAuthenticationService.isLoggedIn()) {
      return true;
    }
    this.solidAuthenticationService.goToLoginPage();
    return false;
  }
}
