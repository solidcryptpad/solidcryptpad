import { Injectable } from '@angular/core';
import { Oidc } from '../../models/oidc';
import { Observable, of } from 'rxjs';
import { NotImplementedException } from 'src/app/exceptions/not-implemented-exception';
import { SolidAuthenticationService } from './solid-authentication.service';
import { UnknownException } from 'src/app/exceptions/unknown-exception';

interface CypressWindowTransfer {
  authenticationMock:
    | {
        use: false;
      }
    | {
        use: true;
        fetch: typeof window['fetch'];
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

  constructor() {
    super();
    console.log('using mocked authentication service');
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
    if (
      !window.cypress?.authenticationMock.use ||
      !window.cypress.authenticationMock.fetch
    ) {
      throw new UnknownException('could not find mock login credentials');
    }
    this.authFetch = window.cypress.authenticationMock.fetch;
    this.webId = window.cypress.authenticationMock.webId;
    console.log('mock authentication service initialized for ' + this.webId);
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
    url: RequestInfo,
    init?: RequestInit
  ): Promise<Response> {
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
