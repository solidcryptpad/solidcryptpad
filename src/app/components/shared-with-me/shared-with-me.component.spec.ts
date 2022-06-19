import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedWithMeComponent } from './shared-with-me.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('SharedWithMeComponent', () => {
  let component: SharedWithMeComponent;
  let fixture: ComponentFixture<SharedWithMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, RouterTestingModule],
      declarations: [SharedWithMeComponent],
      providers: [{ provide: SolidAuthenticationService, useValue: {} }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedWithMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
