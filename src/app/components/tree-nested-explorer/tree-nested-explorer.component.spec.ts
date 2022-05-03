import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeNestedExplorerComponent } from './tree-nested-explorer.component';

describe('TreeNestedExplorerComponent', () => {
  let component: TreeNestedExplorerComponent;
  let fixture: ComponentFixture<TreeNestedExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreeNestedExplorerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeNestedExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
