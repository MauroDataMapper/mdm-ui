import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceDataValuesComponent } from './reference-data-values.component';

describe('ReferenceDataValuesComponent', () => {
  let component: ReferenceDataValuesComponent;
  let fixture: ComponentFixture<ReferenceDataValuesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferenceDataValuesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceDataValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
