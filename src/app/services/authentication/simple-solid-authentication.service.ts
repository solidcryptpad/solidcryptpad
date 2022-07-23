import { Injectable } from '@angular/core';
import * as authnBrowser from '@inrupt/solid-client-authn-browser';
import { Router } from '@angular/router';
import { RequiresLoginException } from '../../exceptions/requires-login-exception';
import { Oidc } from '../../models/oidc';
import { Observable, of } from 'rxjs';
import { SolidAuthenticationService } from './solid-authentication.service';
import { UnknownException } from 'src/app/exceptions/unknown-exception';
import { UserLocalStorage } from '../user-local-storage/user-local-storage.service';
import { NavigationService } from '../navigation/navigation.service';

@Injectable()
export class SimpleSolidAuthenticationService extends SolidAuthenticationService {
  private oidcList: Oidc[] = [
    { name: 'Solid Web', url: 'https://solidweb.org/' },
    { name: 'Solid Community', url: 'https://solidcommunity.net/' },
    { name: 'Inrupt', url: 'https://inrupt.net/' },
  ];
  // store as member to allow mocking in tests
  private authnBrowser: typeof authnBrowser;

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    private userLocalStorage: UserLocalStorage
  ) {
    super();
    this.authnBrowser = authnBrowser;
  }

  override getDefaultOidcProviders(): Oidc[] {
    const copy: Oidc[] = [];
    this.oidcList.forEach((oidc) => copy.push({ ...oidc }));
    return copy;
  }

  override async initializeLoginStatus() {
    this.authnBrowser.onSessionRestore((url) => this.onSessionRestore(url));
    await this.authnBrowser.handleIncomingRedirect({
      restorePreviousSession: true,
    });
  }

  private onSessionRestore(previousUrl: string) {
    const url = new URL(previousUrl);
    this.navigationService.navigateByUrlIgnoringBaseHref(
      url.pathname + url.search + url.hash
    );
  }

  override isLoggedIn(): Observable<boolean> {
    return of(this.authnBrowser.getDefaultSession().info.isLoggedIn);
  }

  override async goToLoginPage(oidc: string) {
    await this.authnBrowser.login({
      oidcIssuer: oidc,
      redirectUrl: window.location.href,
      clientName: 'SolidCryptPad',
    });
  }

  override async authenticatedFetch(
    url: RequestInfo,
    init?: RequestInit
  ): ReturnType<typeof authnBrowser.fetch> {
    return this.authnBrowser.fetch(url, init);
  }

  override async getWebId(): Promise<string> {
    if (await this.isLoggedIn()) {
      const webId = this.authnBrowser.getDefaultSession().info.webId;
      if (!webId)
        throw new UnknownException(
          'Could not find webId despite being logged in'
        );
      return webId;
    }
    throw new RequiresLoginException('Not authenticated yet!');
  }

  override logout() {
    this.authnBrowser.onLogout(() => {
      this.router.navigate(['/']);

      setTimeout(() => {
        window.location.reload();
      }, 0);

      // timeout is needed due to race conditions caused by the framework
    });

    this.userLocalStorage.clear();

    return this.authnBrowser.getDefaultSession().logout();
  }
}
