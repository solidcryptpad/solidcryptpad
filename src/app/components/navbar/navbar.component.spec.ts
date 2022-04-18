import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SolidAuthenticationService } from 'src/app/services/authentication/solid-authentication.service';
import { FormsModule } from '@angular/forms';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationSpy',
      ['goToLoginPage'],
      {
        oidc: [['https://solidweb.org/', 'solidweb']],
      }
    );
    const notificationSpy = jasmine.createSpyObj('NotificationSpy', ['error']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [NavbarComponent],
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
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

  it('should initiate login when clicking login button', () => {
    authenticationServiceSpy.goToLoginPage.and.resolveTo();
    const welcomeElement: HTMLElement = fixture.nativeElement;
    const button = welcomeElement.querySelector('button');
    button?.click();
    expect(authenticationServiceSpy.goToLoginPage).toHaveBeenCalled();
  });

  it('should display error on URL without protocol', () => {
    component.selected = 'invalid.com';
    component.login();
    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });
});
