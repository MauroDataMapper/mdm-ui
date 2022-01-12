import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditContainerComponent } from './bulk-edit-container.component';

describe('BulkEditBaseComponent', () => {
  let component: BulkEditContainerComponent;
  let fixture: ComponentFixture<BulkEditContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkEditContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
