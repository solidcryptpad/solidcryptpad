import { Injectable } from '@angular/core';
import {
  fetch,
  getDefaultSession,
  handleIncomingRedirect,
  login,
} from '@inrupt/solid-client-authn-browser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SolidAuthenticationService {
  constructor(private router: Router) {}

  // TODO explanation
  restoreSession() {
    const locations = JSON.parse(
      window.sessionStorage.getItem('locations') || '{}'
    );

    locations.old = locations.new;
    locations.new = window.location.pathname;

    window.sessionStorage.setItem('locations', JSON.stringify(locations));

    handleIncomingRedirect({ restorePreviousSession: true }).then(() =>
      this.router.navigate([locations.old])
    );
  }

  async goToLoginPage() {
    if (!this.isLoggedIn()) {
      await login({
        oidcIssuer: 'https://solidweb.org/',
        // manually overwritten by restoreSession()
        redirectUrl: window.location.href,
        clientName: 'SolidCryptPad',
      });
    }
  }

  authenticatedFetch(
    url: string,
    init?: RequestInit
  ): ReturnType<typeof fetch> {
    if (this.isLoggedIn()) {
      return fetch(url, init);
    } else {
      throw new Error('Not authenticated yet!');
    }
  }

  isLoggedIn() {
    return getDefaultSession().info.isLoggedIn;
  }
}
