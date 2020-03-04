import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataElementStep3Component } from './data-element-step3.component';

describe('DataElementStep3Component', () => {
  let component: DataElementStep3Component;
  let fixture: ComponentFixture<DataElementStep3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataElementStep3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementStep3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
