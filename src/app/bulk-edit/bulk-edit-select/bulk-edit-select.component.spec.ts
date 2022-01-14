import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditSelectComponent } from './bulk-edit-select.component';

describe('BulkEditSelectComponent', () => {
  let component: BulkEditSelectComponent;
  let fixture: ComponentFixture<BulkEditSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEditSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
