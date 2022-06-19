import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileShareComponent } from './file-share.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LinkShareService } from '../../../services/link-share/link-share.service';
import { FormBuilder } from '@angular/forms';

describe('LinkShareComponent', () => {
  let component: FileShareComponent;
  let fixture: ComponentFixture<FileShareComponent>;

  beforeEach(async () => {
    const linkShareSpy = jasmine.createSpyObj('LinkShareService', [
      'createFolderSharingLink',
      'createFileSharingLink',
    ]);

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatDialogModule],
      declarations: [FileShareComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LinkShareService, useValue: linkShareSpy },
        FormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileShareComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
