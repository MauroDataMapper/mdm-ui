import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSetTermsTableComponent } from './code-set-terms-table.component';

describe('CodeSetTermsTableComponent', () => {
  let component: CodeSetTermsTableComponent;
  let fixture: ComponentFixture<CodeSetTermsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeSetTermsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetTermsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
