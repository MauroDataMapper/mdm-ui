import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataElementBulkEditDialogComponent } from './data-element-bulk-edit-dialog.component';

describe('DataElementBulkEditDialogComponent', () => {
  let component: DataElementBulkEditDialogComponent;
  let fixture: ComponentFixture<DataElementBulkEditDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataElementBulkEditDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementBulkEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
