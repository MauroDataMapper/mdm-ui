import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditEditorGroupComponent } from './bulk-edit-editor-group.component';

describe('BulkEditEditorGroupComponent', () => {
  let component: BulkEditEditorGroupComponent;
  let fixture: ComponentFixture<BulkEditEditorGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEditEditorGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditEditorGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
