import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';

import { ProfileService } from './profile.service';

import { FOAF } from '@inrupt/vocab-common-rdf';
import { createThing } from '@inrupt/solid-client';
import { SolidClientService } from '../module-wrappers/solid-client/solid-client.service';
import { AttributeNotFoundException } from 'src/app/exceptions/attribute-not-found-exception';

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

  it('hasUserName returns true if user has a name', async () => {
    spyOn(service, 'getUserName').and.resolveTo();

    await expectAsync(service.hasUserName()).toBeResolvedTo(true);
  });

  it('hasUserName returns false if user has no name', async () => {
    spyOn(service, 'getUserName').and.rejectWith(
      new AttributeNotFoundException('No username')
    );

    await expectAsync(service.hasUserName()).toBeResolvedTo(false);
  });

  it('getUserName returns Testy as username and calls getStringNoLocale', async () => {
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

  it('returns podUrl', async () => {
    const podUrl = 'testy.solidweb.org';
    solidClientServiceSpy.getPodUrlAll.and.resolveTo([podUrl]);

    return expectAsync(service.getPodUrl()).toBeResolvedTo(podUrl);
  });

  it('getPodUrl throws if no pods are available', async () => {
    solidClientServiceSpy.getPodUrlAll.and.resolveTo([]);

    await expectAsync(service.getPodUrl()).toBeRejected();
  });

  it('returns cached podurl if cached', async () => {
    const podUrl = 'test';
    service.cachedPodUrl = podUrl;

    return expectAsync(service.getPodUrl()).toBeResolvedTo(podUrl);
  });

  it('returns cached userName if cached', async () => {
    const username = 'test';
    service.cachedUserName = username;

    return expectAsync(service.getUserName()).toBeResolvedTo(username);
  });
});
