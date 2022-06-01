import { Oidc } from '../../models/oidc';
import { Observable } from 'rxjs';

/**
 * Service to handle authentication with Solid pods
 *
 * requires to call and wait for initializeLoginStatus
 * before other methods can be used
 */
export abstract class SolidAuthenticationService {
  /**
   * initialize login status including possible redirects:
   *  - handles redirect after login
   *  - handles redirect after restorePreviousSession
   *  - if previously logged in: initiates redirect to restore previous session
   */
  abstract initializeLoginStatus(): Promise<void>;

  abstract isLoggedIn(): Observable<boolean>;

  /**
   * redirect to the oidc login page
   * @param oidc url of the oidc issuer
   */
  abstract goToLoginPage(oidc: string): Promise<void>;

  /**
   * Make a fetch request. If logged in, authentication credentials are added
   * @param url
   * @param init
   */
  abstract authenticatedFetch(
    url: RequestInfo,
    init?: RequestInit
  ): Promise<Response>;

  /**
   * Extracts webId from session information
   *
   * @throws RequiresLoginException if not logged in
   */
  abstract getWebId(): Promise<string>;

  /**
   * Perform a client-side logout and redirect to home page
   */
  abstract logout(): void;

  abstract getDefaultOidcProviders(): Oidc[];
}
