import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileEditorComponent } from './file-editor.component';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('FileEditorComponent', () => {
  let component: FileEditorComponent;
  let fixture: ComponentFixture<FileEditorComponent>;
  let authenticationServiceSpy: jasmine.SpyObj<SolidAuthenticationService>;

  beforeEach(async () => {
    const notificationSpy = jasmine.createSpyObj('NotificationSpy', ['error']);
    const authenticationSpy = jasmine.createSpyObj('SolidAuthenticationSpy', [
      'sendRequest',
      'sendFile',
    ]);
    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule],
      declarations: [FileEditorComponent],
      providers: [
        FileEditorComponent,
        { provide: SolidAuthenticationService, useValue: authenticationSpy },
        {
          provide: NotificationService,
          useValue: notificationSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileEditorComponent);
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
