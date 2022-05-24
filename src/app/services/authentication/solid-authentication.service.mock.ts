import { Injectable } from '@angular/core';
import * as authnBrowser from '@inrupt/solid-client-authn-browser';
import { Router } from '@angular/router';
import { Oidc } from '../../models/oidc';
import { Observable, of } from 'rxjs';
import { NotImplementedException } from 'src/app/exceptions/not-implemented-exception';
import { SolidAuthenticationService } from './solid-authentication.service';
import { buildAuthenticatedFetch } from '@inrupt/solid-client-authn-core';
import { UnknownException } from 'src/app/exceptions/unknown-exception';

interface CypressWindowTransfer {
  authenticationMock:
    | {
        use: false;
      }
    | {
        use: true;
        credentials: {
          accessToken: string;
          dpopKey: any;
        };
        webId: string;
      };
}

declare global {
  interface Window {
    cypress?: CypressWindowTransfer;
  }
}

export function shouldMockAuthenticationService() {
  return window.cypress?.authenticationMock.use;
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
  private authFetch: typeof fetch | undefined;
  private webId: string | undefined;

  constructor(private router: Router) {
    super();
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
    if (
      !window.cypress?.authenticationMock.use ||
      !window.cypress.authenticationMock.credentials
    ) {
      throw new UnknownException('could not find mock login credentials');
    }
    const { accessToken, dpopKey } =
      window.cypress.authenticationMock.credentials;
    this.authFetch = await buildAuthenticatedFetch(window.fetch, accessToken, {
      dpopKey,
    });
    this.webId = window.cypress.authenticationMock.webId;
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
    if (!this.authFetch)
      throw new UnknownException(
        'Tried to use mocked authenticatedFetch before initialitzed'
      );
    return this.authFetch(url, init);
  }

  /**
   * Extracts webId from session information.
   *
   * @throws RequiresLoginException if called before completing login.
   */
  override async getWebId(): Promise<string> {
    if (!this.webId)
      throw new UnknownException('Tried to use getWebId before initialitzed');
    return this.webId;
  }

  override logout() {
    throw new Error(
      'logout is not implemented for mock authentication service'
    );
  }
}
