import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeystoreComponent } from './keystore.component';

describe('KeystoreComponent', () => {
  let component: KeystoreComponent;
  let fixture: ComponentFixture<KeystoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KeystoreComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeystoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
