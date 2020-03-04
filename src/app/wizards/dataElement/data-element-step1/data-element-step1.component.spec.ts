import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataElementStep1Component } from './data-element-step1.component';

describe('DataElementStep1Component', () => {
  let component: DataElementStep1Component;
  let fixture: ComponentFixture<DataElementStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataElementStep1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
