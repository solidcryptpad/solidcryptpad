import { Injectable } from '@angular/core';
import * as authnBrowser from '@inrupt/solid-client-authn-browser';
import { Router } from '@angular/router';
import { RequiresLoginException } from '../../exceptions/requires-login-exception';

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
  // store as member to allow mocking in tests
  private authnBrowser: typeof authnBrowser;

  constructor(private router: Router) {
    this.authnBrowser = authnBrowser;
    this.authnBrowser.onSessionRestore((url) => this.onSessionRestore(url));
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
    await this.authnBrowser.handleIncomingRedirect({
      restorePreviousSession: true,
    });
  }

  private onSessionRestore(previousUrl: string) {
    const url = new URL(previousUrl);
    this.router.navigateByUrl(url.pathname + url.search + url.hash);
  }

  async isLoggedIn(): Promise<boolean> {
    return this.authnBrowser.getDefaultSession().info.isLoggedIn;
  }

  async goToLoginPage(oidc = 'https://solidweb.org/') {
    await this.authnBrowser.login({
      oidcIssuer: oidc,
      redirectUrl: window.location.href,
      clientName: 'SolidCryptPad',
    });
  }

  async authenticatedFetch(
    url: string,
    init?: RequestInit
  ): ReturnType<typeof authnBrowser.fetch> {
    if (await this.isLoggedIn()) {
      return this.authnBrowser.fetch(url, init);
    }
    throw new RequiresLoginException('Not authenticated yet!');
  }

  /**
   * Extracts webId from session information.
   *
   * @throws RequiresLoginException if called before completing login.
   */
  async getWebId(): Promise<string> {
    if (await this.isLoggedIn()) {
      const webId = this.authnBrowser.getDefaultSession().info.webId;
      return webId === undefined ? '' : webId;
    }
    throw new RequiresLoginException('Not authenticated yet!');
  }
}
