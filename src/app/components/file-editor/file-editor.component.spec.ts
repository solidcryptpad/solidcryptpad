import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileEditorComponent } from './file-editor.component';
import { NotificationService } from 'src/app/services/notification/notification.service';

describe('FileEditorComponent', () => {
  let component: FileEditorComponent;
  let fixture: ComponentFixture<FileEditorComponent>;

  beforeEach(async () => {
    const notificationSpy = jasmine.createSpyObj('NotificationSpy', ['error']);

    await TestBed.configureTestingModule({
      declarations: [FileEditorComponent],
      providers: [
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
