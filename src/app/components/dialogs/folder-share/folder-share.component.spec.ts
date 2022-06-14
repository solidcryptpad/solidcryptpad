import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderShareComponent } from './folder-share.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkShareService } from 'src/app/services/link-share/link-share.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('FolderShareComponent', () => {
  let component: FolderShareComponent;
  let fixture: ComponentFixture<FolderShareComponent>;

  beforeEach(async () => {
    const linkShareSpy = jasmine.createSpyObj('LinkShareService', [
      'createFolderSharingLink',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatCheckboxModule,
      ],
      declarations: [FolderShareComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: LinkShareService, useValue: linkShareSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
