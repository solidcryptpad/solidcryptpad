import { TestBed } from '@angular/core/testing';

import { LinkShareService } from './link-share.service';
import { SolidAuthenticationService } from '../authentication/solid-authentication.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('LinkShareService', () => {
  let service: LinkShareService;

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationService',
      ['authenticatedFetch']
    );

    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    });
    service = TestBed.inject(LinkShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
