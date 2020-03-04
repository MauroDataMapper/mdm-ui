import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDataTypeInlineComponent } from './new-data-type-inline.component';

describe('NewDataTypeInlineComponent', () => {
  let component: NewDataTypeInlineComponent;
  let fixture: ComponentFixture<NewDataTypeInlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDataTypeInlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDataTypeInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
