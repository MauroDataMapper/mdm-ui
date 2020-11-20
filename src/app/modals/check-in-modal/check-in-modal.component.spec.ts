import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInModalComponent } from './check-in-modal.component';

describe('CheckInModalComponent', () => {
  let component: CheckInModalComponent;
  let fixture: ComponentFixture<CheckInModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckInModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
