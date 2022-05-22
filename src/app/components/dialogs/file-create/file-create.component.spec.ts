import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { FileCreateComponent } from './file-create.component';

describe('FileCreateComponent', () => {
  let component: FileCreateComponent;
  let fixture: ComponentFixture<FileCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileCreateComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
