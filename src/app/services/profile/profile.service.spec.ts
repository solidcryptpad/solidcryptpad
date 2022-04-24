import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';

import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'getWebId',
    ]);
    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    });
    service = TestBed.inject(ProfileService);
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns webId', () => {
    const webId = 'https://example.pod/profile/card#me';
    authenticationServiceSpy.getWebId.and.resolveTo(webId);
    return expectAsync(service.getWebId()).toBeResolvedTo(webId);
  });
});
