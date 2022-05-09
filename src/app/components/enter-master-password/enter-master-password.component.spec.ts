import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterMasterPasswordComponent } from './enter-master-password.component';

describe('EnterMasterPasswordComponent', () => {
  let component: EnterMasterPasswordComponent;
  let fixture: ComponentFixture<EnterMasterPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnterMasterPasswordComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterMasterPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
