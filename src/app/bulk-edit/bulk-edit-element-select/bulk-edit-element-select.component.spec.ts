import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditElementSelectComponent } from './bulk-edit-element-select.component';

describe('BulkEditElementSelectComponent', () => {
  let component: BulkEditElementSelectComponent;
  let fixture: ComponentFixture<BulkEditElementSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEditElementSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditElementSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
