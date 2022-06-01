import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import * as authnBrowser from '@inrupt/solid-client-authn-browser';
import { Session } from '@inrupt/solid-client-authn-browser';

import { SimpleSolidAuthenticationService } from './simple-solid-authentication.service';
import { Router } from '@angular/router';

describe('SimpleSolidAuthenticationService', () => {
  let service: SimpleSolidAuthenticationService;
  let authnBrowserSpy: jasmine.SpyObj<typeof authnBrowser>;
  let router: Router;

  const mockLoginStatus = (isLoggedIn: boolean) =>
    authnBrowserSpy.getDefaultSession.and.returnValue({
      info: {
        isLoggedIn,
      },
    } as authnBrowser.Session);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
    });
    router = TestBed.inject(Router);
    service = TestBed.inject(
      SimpleSolidAuthenticationService,
      new SimpleSolidAuthenticationService(router)
    );
    authnBrowserSpy = jasmine.createSpyObj('authnBrowserSpy', [
      'onSessionRestore',
      'handleIncomingRedirect',
      'login',
      'getDefaultSession',
      'fetch',
      'logout',
      'onLogout',
    ]);
    service['authnBrowser'] = authnBrowserSpy;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializeLoginStatus calls handleIncomingRedirect and restores previous session', () => {
    authnBrowserSpy.handleIncomingRedirect.and.resolveTo();
    service.initializeLoginStatus();

    expect(authnBrowserSpy.handleIncomingRedirect).toHaveBeenCalledWith({
      restorePreviousSession: true,
    });
  });

  it('isLoggedIn returns true if authnBrowser returns true', async () => {
    mockLoginStatus(true);
    return service
      .isLoggedIn()
      .subscribe((status) => expect(status).toBe(true));
  });

  it('isLoggedIn returns false if authnBrowser returns false', async () => {
    mockLoginStatus(false);
    return service
      .isLoggedIn()
      .subscribe((status) => expect(status).toBe(false));
  });

  it('goToLoginPage passes provided oidc issuer to authnBrowser', () => {
    service.goToLoginPage('https://example.test');
    expect(authnBrowserSpy.login).toHaveBeenCalledWith(
      jasmine.objectContaining({
        oidcIssuer: 'https://example.test',
      })
    );
  });

  it('authenticatedFetch forwards to authnBrowser fetch', async () => {
    await service.authenticatedFetch('https://example.test', {
      method: 'POST',
    });
    expect(authnBrowserSpy.fetch).toHaveBeenCalledWith('https://example.test', {
      method: 'POST',
    });
  });

  it('should return webId stored in session', async () => {
    const session = new Session();
    session.info.webId = 'myWebId';
    authnBrowserSpy.getDefaultSession.and.returnValue(session);

    expect(await service.getWebId()).toBe('myWebId');
  });

  it('should redirect back to landing page by triggering onLogout', () => {
    const session = new Session();
    authnBrowserSpy.getDefaultSession.and.returnValue(session);

    service.logout();
    expect(authnBrowserSpy.onLogout).toHaveBeenCalled();
    expect(router.url).toBe('/');
  });
});
