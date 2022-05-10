import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeystoreComponent } from './keystore.component';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';

describe('KeystoreComponent', () => {
  let component: KeystoreComponent;
  let fixture: ComponentFixture<KeystoreComponent>;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KeystoreComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'ngOnInit',
    ]);
    TestBed.configureTestingModule({
      providers: [
        KeystoreComponent,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    });
    fixture = TestBed.createComponent(KeystoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // eslint-disable-next-line unused-imports/no-unused-vars
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
