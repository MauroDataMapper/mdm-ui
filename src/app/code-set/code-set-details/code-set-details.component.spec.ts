import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSetDetailsComponent } from './code-set-details.component';

describe('CodeSetDetailsComponent', () => {
  let component: CodeSetDetailsComponent;
  let fixture: ComponentFixture<CodeSetDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeSetDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
