import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MatToolbar } from '@angular/material/toolbar';
import {
  MatSlideToggle,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { SolidAuthenticationService } from './services/authentication/solid-authentication.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'getWebId',
    ]);
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatDialogModule,
      ],
      declarations: [
        AppComponent,
        NavbarComponent,
        MatToolbar,
        MatIcon,
        MatSlideToggle,
      ],
      providers: [
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
