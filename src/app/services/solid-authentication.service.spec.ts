import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import * as authnBrowser from '@inrupt/solid-client-authn-browser';

import { SolidAuthenticationService } from './solid-authentication.service';

describe('SolidAuthenticationService', () => {
  let service: SolidAuthenticationService;
  let authnBrowserSpy: jasmine.SpyObj<typeof authnBrowser>;

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
    service = TestBed.inject(SolidAuthenticationService);
    authnBrowserSpy = jasmine.createSpyObj('authnBrowserSpy', [
      'handleIncomingRedirect',
      'login',
      'getDefaultSession',
      'fetch',
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

  it('isLoggedIn returns true if authnBrowser returns true', () => {
    mockLoginStatus(true);
    return expectAsync(service.isLoggedIn()).toBeResolvedTo(true);
  });

  it('isLoggedIn returns false if authnBrowser returns false', () => {
    mockLoginStatus(false);
    return expectAsync(service.isLoggedIn()).toBeResolvedTo(false);
  });

  it('goToLoginPage passes provided oidc issuer to authnBrowser', () => {
    service.goToLoginPage('https://example.test');
    expect(authnBrowserSpy.login).toHaveBeenCalledWith(
      jasmine.objectContaining({
        oidcIssuer: 'https://example.test',
      })
    );
  });

  it('authenticatedFetch throws if not logged in', () => {
    mockLoginStatus(false);
    return expectAsync(
      service.authenticatedFetch('https://example.org')
    ).toBeRejectedWithError();
  });

  it('authenticatedFetch forwards to authnBrowser fetch if logged in', async () => {
    mockLoginStatus(true);
    await service.authenticatedFetch('https://example.test', {
      method: 'POST',
    });
    expect(authnBrowserSpy.fetch).toHaveBeenCalledWith('https://example.test', {
      method: 'POST',
    });
  });
});
