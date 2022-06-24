import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedByMeComponent } from './shared-by-me.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SolidAuthenticationService } from '../../services/authentication/solid-authentication.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrService } from 'ngx-toastr';

describe('SharedByMeComponent', () => {
  let component: SharedByMeComponent;
  let fixture: ComponentFixture<SharedByMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, RouterTestingModule],
      declarations: [SharedByMeComponent],
      providers: [
        { provide: SolidAuthenticationService, useValue: {} },
        { provide: ToastrService, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SharedByMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
