import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinaliseModalComponent } from './finalise-modal.component';

describe('FinaliseModalComponent', () => {
  let component: FinaliseModalComponent;
  let fixture: ComponentFixture<FinaliseModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinaliseModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinaliseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
