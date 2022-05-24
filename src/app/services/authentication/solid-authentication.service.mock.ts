import { Injectable } from '@angular/core';
import * as authnBrowser from '@inrupt/solid-client-authn-browser';
import { Router } from '@angular/router';
import { Oidc } from '../../models/oidc';
import { Observable, of } from 'rxjs';
import { NotImplementedException } from 'src/app/exceptions/not-implemented-exception';
import { SolidAuthenticationService } from './solid-authentication.service';

declare global {
  interface Window {
    useMockAuthenticationService?: boolean;
  }
}

export function shouldMockAuthenticationService() {
  return window.useMockAuthenticationService;
}

@Injectable()
/**
 * Service to handle authentication with Solid pods
 *
 * requires to call and wait for initializeLoginStatus
 * before other methods can be used
 */
export class MockSolidAuthenticationService extends SolidAuthenticationService {
  private oidcList: Oidc[] = [
    { name: 'Solid Web', url: 'https://solidweb.org/' },
    { name: 'Solid Community', url: 'https://solidcommunity.net/' },
    { name: 'Inrupt', url: 'https://inrupt.net/' },
  ];
  // store as member to allow mocking in tests
  private authnBrowser: typeof authnBrowser;

  constructor(private router: Router) {
    super();
    this.authnBrowser = authnBrowser;
  }

  override getDefaultOidcProviders(): Oidc[] {
    const copy: Oidc[] = [];
    this.oidcList.forEach((oidc) => copy.push({ ...oidc }));
    return copy;
  }

  /**
   * initialize login status including possible redirects:
   *  - handles redirect after login
   *  - handles redirect after restorePreviousSession
   *  - if previously logged in: initiates redirect to restore previous session
   */
  override async initializeLoginStatus() {
    console.log('initializing mock authentication service');
  }

  /**
   * Login status is never changing during session
   */
  override isLoggedIn(): Observable<boolean> {
    return of(true);
  }

  override goToLoginPage(): Promise<void> {
    throw new NotImplementedException(
      'goToLoginPage is not implemented for mock authentication service'
    );
  }

  override async authenticatedFetch(
    url: string,
    init?: RequestInit
  ): ReturnType<typeof authnBrowser.fetch> {
    console.log('authenticatedFetch');
    return this.authnBrowser.fetch(url, init);
  }

  /**
   * Extracts webId from session information.
   *
   * @throws RequiresLoginException if called before completing login.
   */
  override async getWebId(): Promise<string> {
    throw new NotImplementedException(
      'getWebId is not implemented for mock authentication service'
    );
  }

  override logout() {
    throw new Error(
      'logout is not implemented for mock authentication service'
    );
  }
}
