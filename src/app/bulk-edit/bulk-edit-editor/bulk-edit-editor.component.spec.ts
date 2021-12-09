import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditEditorComponent } from './bulk-edit-editor.component';

describe('BulkEditEditorComponent', () => {
  let component: BulkEditEditorComponent;
  let fixture: ComponentFixture<BulkEditEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEditEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
