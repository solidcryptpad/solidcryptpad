import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolidAuthenticationService } from 'src/app/services/solid-authentication.service';

import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(async () => {
    const authenticationSpy = jasmine.createSpyObj(
      'SolidAuthenticationSpy',
      ['goToLoginPage'],
      {
        oidc: [['https://solidweb.org/', 'solidweb']],
      }
    );

    await TestBed.configureTestingModule({
      providers: [
        WelcomeComponent,
        {
          provide: SolidAuthenticationService,
          useValue: authenticationSpy,
        },
      ],
    }).compileComponents();
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
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
    const welcomeElement: HTMLElement = fixture.nativeElement;
    const button = welcomeElement.querySelector('button');
    button?.click();
    expect(authenticationServiceSpy.goToLoginPage).toHaveBeenCalled();
  });
});
