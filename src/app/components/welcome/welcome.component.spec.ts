import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeComponent } from './welcome.component';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { NotificationService } from '../../services/notification/notification.service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { of } from 'rxjs';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationSpy',
      ['goToLoginPage', 'isLoggedIn'],
      {
        oidc: [{ name: 'Solid Web', url: 'https://solidweb.org/' }],
      }
    );
    const notificationSpy = jasmine.createSpyObj('NotificationSpy', ['error']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        MatAutocompleteModule,
      ],
      declarations: [WelcomeComponent],
      providers: [
        {
          provide: SolidAuthenticationService,
          useValue: authenticationSpy,
        },
        {
          provide: NotificationService,
          useValue: notificationSpy,
        },
      ],
    }).compileComponents();

    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
    notificationServiceSpy = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;

    authenticationServiceSpy.isLoggedIn.and.returnValue(of(false));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have <button> containing "Login"', () => {
    const welcomeElement: HTMLElement = fixture.nativeElement;
    const button = welcomeElement.querySelector('button');
    expect(button?.textContent?.toLowerCase()).toContain('login');
  });

  fit('should initiate login when clicking login button', () => {
    component.oidcSelection.setValue('https://solidweb.org/');

    authenticationServiceSpy.goToLoginPage.and.resolveTo();
    const welcomeElement: HTMLElement = fixture.nativeElement;
    const button = welcomeElement.querySelector('button');
    button?.click();
    // übeltäter
    expect(authenticationServiceSpy.goToLoginPage).toHaveBeenCalled();
  });

  it('should display error on URL without protocol', () => {
    authenticationServiceSpy.goToLoginPage('invalid.com');
    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });
});
