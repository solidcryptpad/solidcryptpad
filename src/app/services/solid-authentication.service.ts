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

  private sessionRestoreCallbacks: (() => void)[] = [];

  // TODO explanation
  restoreSession() {
    const locations = JSON.parse(
      window.sessionStorage.getItem('locations') || '{}'
    );

    locations.old = locations.new;
    locations.new = window.location.pathname;

    window.sessionStorage.setItem('locations', JSON.stringify(locations));

    handleIncomingRedirect({ restorePreviousSession: true }).then(
      (sessionInfo) => {
        console.log('restored session', sessionInfo);
        if (sessionInfo?.isLoggedIn) {
          this.router.navigate([locations.old]);
        }
        this.sessionRestoreCallbacks.forEach((cb) => cb());
        this.sessionRestoreCallbacks = [];
      }
    );
  }

  waitForSessionRestore() {
    if (this.isLoggedIn()) return Promise.resolve();
    return new Promise((resolve) => {
      this.sessionRestoreCallbacks.push(() => resolve(undefined));
    });
  }

  async goToLoginPage() {
    await login({
      oidcIssuer: 'https://solidweb.org/',
      // manually overwritten by restoreSession()
      redirectUrl: window.location.href,
      clientName: 'SolidCryptPad',
    });
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
