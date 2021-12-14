import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditBaseComponent } from './bulk-edit-base.component';

describe('BulkEditBaseComponent', () => {
  let component: BulkEditBaseComponent;
  let fixture: ComponentFixture<BulkEditBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEditBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
