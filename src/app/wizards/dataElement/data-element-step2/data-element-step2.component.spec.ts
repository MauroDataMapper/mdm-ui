import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataElementStep2Component } from './data-element-step2.component';

describe('DataElementStep2Component', () => {
  let component: DataElementStep2Component;
  let fixture: ComponentFixture<DataElementStep2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataElementStep2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementStep2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
