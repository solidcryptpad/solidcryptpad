import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SolidAuthenticationService } from 'src/app/services/authentication/solid-authentication.service';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, Routes } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let router: Router;

  const getLinkByText = (text: string): HTMLElement => {
    const links: HTMLElement[] = [
      ...fixture.nativeElement.getElementsByTagName('a'),
    ];
    const linksWithText = links.filter((el) => el.textContent === text);
    return linksWithText[0];
  };

  beforeEach(async () => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationSpy',
      ['goToLoginPage'],
      {
        oidc: [['https://solidweb.org/', 'solidweb']],
      }
    );
    const notificationSpy = jasmine.createSpyObj('NotificationSpy', ['error']);
    const routes = [
      { path: '', component: {} },
      { path: 'home', component: {} },
      { path: 'fileEditor', component: {} },
    ] as Routes;

    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule.withRoutes(routes)],
      declarations: [NavbarComponent, MatToolbar],
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

    router = TestBed.inject(Router);
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

  it('should have title containing SolidCryptPad', () => {
    const titleLink = fixture.nativeElement.querySelector('h1 a');

    expect(titleLink.innerText).toContain('SolidCryptPad');
  });

  it('should go to welcome when clicking on title', fakeAsync(() => {
    router.navigateByUrl('/home');
    tick();

    getLinkByText('SolidCryptPad').click();
    tick();

    expect(router.url).toBe('/');
  }));

  it('should go to home when clicking on Home', fakeAsync(() => {
    getLinkByText('Home').click();
    tick();

    expect(router.url).toBe('/home');
  }));

  it('should go to files when clicking on Files', fakeAsync(() => {
    getLinkByText('Files').click();
    tick();

    expect(router.url).toBe('/fileEditor');
  }));

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
