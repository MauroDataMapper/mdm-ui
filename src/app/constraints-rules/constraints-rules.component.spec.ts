import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstraintsRulesComponent } from './constraints-rules.component';

describe('ConstraintsRulesComponent', () => {
  let component: ConstraintsRulesComponent;
  let fixture: ComponentFixture<ConstraintsRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConstraintsRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstraintsRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
