import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassifierStep1Component } from './classifier-step1.component';

describe('ClassifierStep1Component', () => {
  let component: ClassifierStep1Component;
  let fixture: ComponentFixture<ClassifierStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassifierStep1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassifierStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
