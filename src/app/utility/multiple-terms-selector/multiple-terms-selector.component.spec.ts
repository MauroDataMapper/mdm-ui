import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleTermsSelectorComponent } from './multiple-terms-selector.component';

describe('MultipleTermsSelectorComponent', () => {
  let component: MultipleTermsSelectorComponent;
  let fixture: ComponentFixture<MultipleTermsSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleTermsSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleTermsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
