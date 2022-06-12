import { TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';

import { SolidPermissionService } from './solid-permission.service';

describe('SolidPermissionService', () => {
  let service: SolidPermissionService;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['authenticatedFetch']
    );

    TestBed.configureTestingModule({
      providers: [
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    });
    service = TestBed.inject(SolidPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
