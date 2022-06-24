import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DeleteConfirmationComponent } from './delete-confirmation.component';

describe('DeleteConfirmationComponent', () => {
  let component: DeleteConfirmationComponent;
  let fixture: ComponentFixture<DeleteConfirmationComponent>;
  let matdialogSpy: jasmine.SpyObj<MatDialogRef<DeleteConfirmationComponent>>;

  beforeEach(async () => {
    const matdialogSpyObj = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      declarations: [DeleteConfirmationComponent],
      providers: [
        { provide: MatDialogRef, useValue: matdialogSpyObj },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    matdialogSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<DeleteConfirmationComponent>
    >;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('close should close with true', () => {
    component.delete();
    expect(matdialogSpy.close).toHaveBeenCalledOnceWith(true);
  });

  it('cancel should close with false', () => {
    component.cancel();
    expect(matdialogSpy.close).toHaveBeenCalledOnceWith(false);
  });
});
