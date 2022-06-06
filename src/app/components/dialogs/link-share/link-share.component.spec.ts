import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkShareComponent } from './link-share.component';

describe('LinkShareComponent', () => {
  let component: LinkShareComponent;
  let fixture: ComponentFixture<LinkShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinkShareComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
