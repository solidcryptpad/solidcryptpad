import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedByMeComponent } from './shared-by-me.component';

describe('SharedByMeComponent', () => {
  let component: SharedByMeComponent;
  let fixture: ComponentFixture<SharedByMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SharedByMeComponent],
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
