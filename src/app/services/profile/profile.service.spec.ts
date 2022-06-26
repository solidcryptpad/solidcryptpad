import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';

import { ProfileService } from './profile.service';

import { FOAF } from '@inrupt/vocab-common-rdf';
import { createThing } from '@inrupt/solid-client';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let solidClientServiceSpy: jasmine.SpyObj<SolidClientService>;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'getWebId',
    ]);

    const solidClientSpy = jasmine.createSpyObj('SolidClientService', [
      'getStringNoLocale',
      'getPodUrlAll',
      'getSolidDataset',
      'getThing',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        { provide: SolidClientService, useValue: solidClientSpy },
      ],
    });
    service = TestBed.inject(ProfileService);
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;

    solidClientServiceSpy = TestBed.inject(
      SolidClientService
    ) as jasmine.SpyObj<SolidClientService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns webId', () => {
    const webId = 'https://example.pod/profile/card#me';
    authenticationServiceSpy.getWebId.and.resolveTo(webId);
    return expectAsync(service.getWebId()).toBeResolvedTo(webId);
  });

  it('returns Testy as username and calls getStringNoLocale', async () => {
    const profile = createThing();
    const webId = 'https://example.pod/profile/card#me';

    authenticationServiceSpy.getWebId.and.resolveTo(webId);
    solidClientServiceSpy.getThing.and.returnValue(profile);
    solidClientServiceSpy.getStringNoLocale.and.returnValue('Testy');

    await expectAsync(service.getUserName()).toBeResolvedTo('Testy');

    return expect(solidClientServiceSpy.getStringNoLocale).toHaveBeenCalledWith(
      profile,
      FOAF.name
    );
  });

  it('returns podUrl in array', async () => {
    const podUrls = ['testy.solidweb.org'];
    await solidClientServiceSpy.getPodUrlAll.and.resolveTo(podUrls);

    return expectAsync(service.getPodUrls()).toBeResolvedTo(podUrls);
  });

  it('returns cached podurl if cached', async () => {
    const pods = ['test'];
    service.cachedPodUrls = pods;

    return expectAsync(service.getPodUrls()).toBeResolvedTo(pods);
  });

  it('returns cached userName if cached', async () => {
    const username = 'test';
    service.cachedUserName = username;

    return expectAsync(service.getUserName()).toBeResolvedTo(username);
  });
});
