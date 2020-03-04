import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVersionDataModelComponent } from './new-version-data-model.component';

describe('NewVersionDataModelComponent', () => {
  let component: NewVersionDataModelComponent;
  let fixture: ComponentFixture<NewVersionDataModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewVersionDataModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewVersionDataModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
