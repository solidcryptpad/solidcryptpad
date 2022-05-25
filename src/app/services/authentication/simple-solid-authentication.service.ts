import { Injectable } from '@angular/core';
import * as authnBrowser from '@inrupt/solid-client-authn-browser';
import { Router } from '@angular/router';
import { RequiresLoginException } from '../../exceptions/requires-login-exception';
import { Oidc } from '../../models/oidc';
import { Observable, of } from 'rxjs';
import { SolidAuthenticationService } from './solid-authentication.service';
import { UnknownException } from 'src/app/exceptions/unknown-exception';

@Injectable()
export class SimpleSolidAuthenticationService extends SolidAuthenticationService {
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

  override async initializeLoginStatus() {
    this.authnBrowser.onSessionRestore((url) => this.onSessionRestore(url));
    await this.authnBrowser.handleIncomingRedirect({
      restorePreviousSession: true,
    });
  }

  private onSessionRestore(previousUrl: string) {
    const url = new URL(previousUrl);
    this.router.navigateByUrl(url.pathname + url.search + url.hash);
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
    return this.authnBrowser.getDefaultSession().logout();
  }
}