import { Observable } from 'rxjs';
import { Oidc } from 'src/app/models/oidc';

export interface ISolidAuthenticationService {
  /**
   * initialize login status including possible redirects:
   *  - handles redirect after login
   *  - handles redirect after restorePreviousSession
   *  - if previously logged in: initiates redirect to restore previous session
   */
  initializeLoginStatus(): Promise<void>;

  isLoggedIn(): Observable<boolean>;

  /**
   * redirect to the oidc login page
   * @param oidc url of the oidc issuer
   */
  goToLoginPage(oidc: string): Promise<void>;

  /**
   * return the webId of the currently logged in user
   * return '' if not logged in
   * TODO: check if this is true
   */
  getWebId(): Promise<string>;

  /**
   * Make a fetch request. If logged in, authentication credentials are added
   * @param url
   * @param init
   */
  authenticatedFetch(url: string, init?: RequestInit): Promise<Response>;

  /**
   * Perform a client-side logout and redirect to home page
   */
  logout(): void;

  getDefaultOidcProviders(): Oidc[];
}
