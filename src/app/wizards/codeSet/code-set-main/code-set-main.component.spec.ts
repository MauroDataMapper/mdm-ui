import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSetMainComponent } from './code-set-main.component';

describe('CodeSetMainComponent', () => {
  let component: CodeSetMainComponent;
  let fixture: ComponentFixture<CodeSetMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodeSetMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSetMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
