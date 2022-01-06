import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateCellEditorComponent } from './date-cell-editor.component';

describe('DateCellEditorComponent', () => {
  let component: DateCellEditorComponent;
  let fixture: ComponentFixture<DateCellEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateCellEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateCellEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
