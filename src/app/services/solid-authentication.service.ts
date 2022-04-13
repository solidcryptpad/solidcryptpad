import { Injectable } from '@angular/core';
import {
  fetch,
  getDefaultSession,
  handleIncomingRedirect,
  login,
  onSessionRestore,
} from '@inrupt/solid-client-authn-browser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
/**
 * Service to handle authentication with Solid pods
 *
 * requires to call and wait for initializeLoginStatus
 * before other methods can be used
 */
export class SolidAuthenticationService {
  private oidc_list: string[][] = [
    ['https://solidweb.org/', 'solidweb'],
    ['https://solidcommunity.net/', 'solidcommunity'],
    ['https://inrupt.net/', 'inrupt'],
  ];

  constructor(private router: Router) {
    onSessionRestore((url) => this.onSessionRestore(url));
  }

  public get oidc() {
    return this.oidc_list;
  }

  /**
   * initialize login status including possible redirects:
   *  - handles redirect after login
   *  - handles redirect after restorePreviousSession
   *  - if previously logged in: initiates redirect to restore previous session
   */
  async initializeLoginStatus() {
    await handleIncomingRedirect({
      restorePreviousSession: true,
    });
  }

  private onSessionRestore(previousUrl: string) {
    const url = new URL(previousUrl);
    this.router.navigateByUrl(url.pathname + url.search + url.hash);
  }

  async isLoggedIn(): Promise<boolean> {
    return getDefaultSession().info.isLoggedIn;
  }

  async goToLoginPage(oidc = 'https://solidweb.org/') {
    await login({
      oidcIssuer: oidc,
      redirectUrl: window.location.href,
      clientName: 'SolidCryptPad',
    });
  }

  async authenticatedFetch(
    url: string,
    init?: RequestInit
  ): ReturnType<typeof fetch> {
    if (await this.isLoggedIn()) {
      return fetch(url, init);
    }
    throw new Error('Not authenticated yet!');
  }
}
