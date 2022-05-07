import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileEditorComponent } from './file-editor.component';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
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
      declarations: [FileEditorComponent],
      imports: [RouterTestingModule],
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
    authenticationServiceSpy = TestBed.inject(
      SolidAuthenticationService
    ) as jasmine.SpyObj<SolidAuthenticationService>;
    console.log(authenticationServiceSpy); //Temp. Fix for lint error 'authenticationServiceSpy' is assigned a value but never used'
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
