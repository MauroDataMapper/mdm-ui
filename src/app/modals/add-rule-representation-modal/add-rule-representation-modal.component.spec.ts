import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRuleRepresentationModalComponent } from './add-rule-representation-modal.component';

describe('AddRuleRepresentationModalComponent', () => {
  let component: AddRuleRepresentationModalComponent;
  let fixture: ComponentFixture<AddRuleRepresentationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRuleRepresentationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRuleRepresentationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
