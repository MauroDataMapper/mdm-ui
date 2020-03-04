import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSetComponent } from './code-set.component';

describe('CodeSetComponent', () => {
  let component: CodeSetComponent;
  let fixture: ComponentFixture<CodeSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
