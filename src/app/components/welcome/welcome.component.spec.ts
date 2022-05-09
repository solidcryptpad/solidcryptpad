import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeComponent } from './welcome.component';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { NotificationService } from '../../services/notification/notification.service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

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
        MatFormFieldModule,
        MatMenuModule,
        HttpClientModule,
        MatInputModule,
        NoopAnimationsModule,
      ],
      declarations: [WelcomeComponent, MatFormField, MatLabel, MatIcon],
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

    const matIconRegistry = TestBed.inject(MatIconRegistry);
    const domSanitizer = TestBed.inject(DomSanitizer);

    matIconRegistry.addSvgIcon(
      'solid',
      domSanitizer.bypassSecurityTrustResourceUrl('../assets/solid-emblem.svg')
    );

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

  it('should initiate login when clicking login button', () => {
    component.oidcSelection.setValue('https://solidweb.org/');
    fixture.detectChanges();

    authenticationServiceSpy.goToLoginPage.and.resolveTo();
    const welcomeElement: HTMLElement = fixture.nativeElement;
    const button = welcomeElement.querySelector('button');
    button?.click();
    expect(authenticationServiceSpy.goToLoginPage).toHaveBeenCalled();
  });

  it('button should not be clickable for invalid url', () => {
    component.oidcSelection.setValue('invalid.com');
    fixture.detectChanges();
    const welcomeElement: HTMLElement = fixture.nativeElement;
    const button = welcomeElement.querySelector('button');
    expect(button?.disabled).toBe(true);
  });
});
