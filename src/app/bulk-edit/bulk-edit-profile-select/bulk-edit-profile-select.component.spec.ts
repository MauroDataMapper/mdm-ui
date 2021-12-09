import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditProfileSelectComponent } from './bulk-edit-profile-select.component';

describe('BulkEditProfileSelectComponent', () => {
  let component: BulkEditProfileSelectComponent;
  let fixture: ComponentFixture<BulkEditProfileSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEditProfileSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditProfileSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
