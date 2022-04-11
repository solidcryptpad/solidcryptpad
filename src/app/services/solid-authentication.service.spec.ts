import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SolidAuthenticationService } from './solid-authentication.service';

describe('SolidAuthenticationService', () => {
  let service: SolidAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
    });
    service = TestBed.inject(SolidAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initializeLoginStatus change isInitialized to true ', async () => {
    expect(service['isInitialized']).toBeFalse();
    await service.initializeLoginStatus();
    expect(service['isInitialized']).toBeTrue();
  });

  it('initializeLoginStatus call onLoginStatusKnown', async () => {
    const onLoginStatusKnownSpy = spyOn<any>(service, 'onLoginStatusKnown');
    await service.initializeLoginStatus();
    expect(onLoginStatusKnownSpy).toHaveBeenCalled();
  });

  it('onLoginStatusKnown change isInitialized to true ', async () => {
    expect(service['isInitialized']).toBeFalse();
    service['onLoginStatusKnown']();
    expect(service['isInitialized']).toBeTrue();
  });

  it('isLoggedIn call waitUntilInitialized', async () => {
    const waitUntilInitializedSpy = spyOn<any>(service, 'waitUntilInitialized');
    await service.isLoggedIn();
    expect(waitUntilInitializedSpy).toHaveBeenCalled();
  });

  it('isLoggedIn call isStoredLoggedIn', async () => {
    spyOn<any>(service, 'waitUntilInitialized');
    const isStoredLoggedInSpy = spyOn<any>(service, 'isStoredLoggedIn');
    await service.isLoggedIn();
    expect(isStoredLoggedInSpy).toHaveBeenCalled();
  });

  it('waitUntilInitialized resolves when onLoginStatusKnown is called', async () => {
    const promise = service['waitUntilInitialized']();
    await expectAsync(promise).toBePending();
    service['onLoginStatusKnown']();
    await expectAsync(promise).toBeResolved();
  });
});
