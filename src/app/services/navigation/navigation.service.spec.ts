import { LocationStrategy } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let locationStrategySpy: jasmine.SpyObj<LocationStrategy>;
  let routerSpy: jasmine.SpyObj<Router>;

  const givenBaseHref = (baseHref: string) =>
    locationStrategySpy.getBaseHref.and.returnValue(baseHref);

  beforeEach(() => {
    const locationStrategySpyObj = jasmine.createSpyObj('LocationStrategy', [
      'getBaseHref',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: LocationStrategy, useValue: locationStrategySpyObj },
        { provide: Router, useValue: routerSpyObj },
      ],
    });

    service = TestBed.inject(NavigationService);
    locationStrategySpy = TestBed.inject(
      LocationStrategy
    ) as jasmine.SpyObj<LocationStrategy>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('calls router.navigateByUrl without base href', () => {
    givenBaseHref('/solidcryptpad/');

    service.navigateByUrlIgnoringBaseHref('/solidcryptpad/files#test');

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/files#test');
  });

  it('calls router.navigateByUrl with same url if it does not include base href', () => {
    givenBaseHref('/solidcryptpad/');

    service.navigateByUrlIgnoringBaseHref('/files#test');

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/files#test');
  });

  it('getAppRoot returns origin and base-href', () => {
    givenBaseHref('/solidcryptpad/');
    spyOn<any>(service, 'getOrigin').and.returnValue('https://example.org');

    const appRoot = service.getAppRoot();

    expect(appRoot).toBe('https://example.org/solidcryptpad/');
  });
});
