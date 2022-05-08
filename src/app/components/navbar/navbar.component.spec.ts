import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, Routes } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { MockLoggedInDirective } from 'src/app/directives/logged-in.directive.mock';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  const getLinkByText = (text: string): HTMLElement => {
    const links: HTMLElement[] = [
      ...fixture.nativeElement.getElementsByTagName('a'),
    ];
    const linksWithText = links.filter((el) => el.textContent === text);
    return linksWithText[0];
  };

  beforeEach(async () => {
    const notificationSpy = jasmine.createSpyObj('NotificationSpy', ['error']);
    const routes = [
      { path: '', component: {} },
      { path: 'home', component: {} },
      { path: 'fileEditor', component: {} },
    ] as Routes;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatMenuModule,
        RouterTestingModule.withRoutes(routes),
      ],
      declarations: [
        NavbarComponent,
        MatToolbar,
        MatIcon,
        MockLoggedInDirective,
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: notificationSpy,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;

    // simulate all mocked appLogedIn directives to be true
    for (const node of fixture.debugElement.queryAllNodes(
      By.directive(MockLoggedInDirective)
    )) {
      const mockedLoggedInDirective = node.injector.get(MockLoggedInDirective);
      mockedLoggedInDirective.mockLogin();
    }
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
});
