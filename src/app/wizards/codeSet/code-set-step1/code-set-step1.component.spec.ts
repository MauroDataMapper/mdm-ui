import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSetStep1Component } from './code-set-step1.component';

describe('CodeSetStep1Component', () => {
  let component: CodeSetStep1Component;
  let fixture: ComponentFixture<CodeSetStep1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeSetStep1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
