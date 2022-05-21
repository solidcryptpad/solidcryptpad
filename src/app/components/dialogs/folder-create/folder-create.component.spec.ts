import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderCreateComponent } from './folder-create.component';

describe('FolderCreateComponent', () => {
  let component: FolderCreateComponent;
  let fixture: ComponentFixture<FolderCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FolderCreateComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
