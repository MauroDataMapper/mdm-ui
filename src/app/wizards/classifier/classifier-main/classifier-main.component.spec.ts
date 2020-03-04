import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassifierMainComponent } from './classifier-main.component';

describe('ClassifierMainComponent', () => {
  let component: ClassifierMainComponent;
  let fixture: ComponentFixture<ClassifierMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassifierMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassifierMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
