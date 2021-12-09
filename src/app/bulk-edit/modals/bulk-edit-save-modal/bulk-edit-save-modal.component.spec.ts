import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditSaveModalComponent } from './bulk-edit-save-modal.component';

describe('BulkEditSaveModalComponent', () => {
  let component: BulkEditSaveModalComponent;
  let fixture: ComponentFixture<BulkEditSaveModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEditSaveModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditSaveModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
