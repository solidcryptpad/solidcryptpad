import { Injectable } from '@angular/core';
import * as authnBrowser from '@inrupt/solid-client-authn-browser';
import { Router } from '@angular/router';
import { RequiresLoginException } from '../../exceptions/requires-login-exception';
import { Oidc } from '../../models/oidc';
import { Observable, of } from 'rxjs';

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
  private oidcList: Oidc[] = [
    { name: 'Solid Web', url: 'https://solidweb.org/' },
    { name: 'Solid Community', url: 'https://solidcommunity.net/' },
    { name: 'Inrupt', url: 'https://inrupt.net/' },
  ];
  // store as member to allow mocking in tests
  private authnBrowser: typeof authnBrowser;

  constructor(private router: Router) {
    this.authnBrowser = authnBrowser;
  }

  public get oidc() {
    return this.oidcList;
  }

  /**
   * initialize login status including possible redirects:
   *  - handles redirect after login
   *  - handles redirect after restorePreviousSession
   *  - if previously logged in: initiates redirect to restore previous session
   */
  async initializeLoginStatus() {
    this.authnBrowser.onSessionRestore((url) => this.onSessionRestore(url));
    await this.authnBrowser.handleIncomingRedirect({
      restorePreviousSession: true,
    });
  }

  private onSessionRestore(previousUrl: string) {
    const url = new URL(previousUrl);
    this.router.navigateByUrl(url.pathname + url.search + url.hash);
  }

  /**
   * Login status is never changing during session
   */
  isLoggedIn(): Observable<boolean> {
    return of(this.authnBrowser.getDefaultSession().info.isLoggedIn);
  }

  async goToLoginPage(oidc: string) {
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
    let loginStatus;
    this.isLoggedIn().subscribe((status) => {
      loginStatus = status;
    });

    if (loginStatus) {
      return this.authnBrowser.fetch(url, init);
    } else {
      throw new RequiresLoginException('Not authenticated yet!');
    }
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

  logout() {
    this.authnBrowser.onLogout(() => {
      this.router.navigate(['/']);

      setTimeout(() => {
        window.location.reload();
      }, 0);

      // timeout is needed due to race conditions caused by the framework
    });
    return this.authnBrowser.getDefaultSession().logout();
  }
}
