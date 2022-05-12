import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileExplorerComponent } from './file-explorer.component';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(async () => {
    const notificationSpy = jasmine.createSpyObj('NotificationSpy', ['error']);
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'sendRequest',
      'sendFile',
    ]);
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [FileExplorerComponent],
      providers: [
        FileExplorerComponent,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        {
          provide: NotificationService,
          useValue: notificationSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileExplorerComponent);
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
