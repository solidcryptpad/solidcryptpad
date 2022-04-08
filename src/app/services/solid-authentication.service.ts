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
export class SolidAuthenticationService {
  private oidc: string[][] = [
    ['https://solidweb.org/', 'solidweb'],
    ['https://solidcommunity.net/', 'solidcommunity'],
    ['https://inrupt.net/', 'inrupt'],
  ];

  private initializedCallbacks: (() => void)[] = [];
  private isInitialized = false;

  constructor(private router: Router) {
    onSessionRestore((url) => this.onSessionRestore(url));
  }

  public get defaultOidc() {
    return this.oidc;
  }

  /**
   * initialize login status including possible redirects:
   *  - handles redirect after login
   *  - handles redirect after restorePreviousSession
   *  - if previously logged in: initiates redirect to restore previous session
   */
  initializeLoginStatus() {
    handleIncomingRedirect({
      restorePreviousSession: true,
    }).then(() => this.onLoginStatusKnown());
  }

  private onSessionRestore(previousUrl: string) {
    const url = new URL(previousUrl);
    this.router.navigateByUrl(url.pathname + url.search + url.hash);
  }

  private waitUntilInitialized(): Promise<undefined> {
    if (this.isInitialized) return Promise.resolve(undefined);
    return new Promise((resolve) =>
      this.initializedCallbacks.push(() => resolve(undefined))
    );
  }

  private onLoginStatusKnown() {
    this.isInitialized = true;
    this.initializedCallbacks.forEach((cb) => cb());
    this.initializedCallbacks = [];
  }

  async isLoggedIn(): Promise<boolean> {
    await this.waitUntilInitialized();
    return this.isStoredLoggedIn();
  }

  private isStoredLoggedIn(): boolean {
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
