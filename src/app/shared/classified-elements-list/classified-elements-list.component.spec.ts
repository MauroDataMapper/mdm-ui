import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassifiedElementsListComponent } from './classified-elements-list.component';

describe('ClassifiedElementsListComponent', () => {
  let component: ClassifiedElementsListComponent;
  let fixture: ComponentFixture<ClassifiedElementsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassifiedElementsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassifiedElementsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
