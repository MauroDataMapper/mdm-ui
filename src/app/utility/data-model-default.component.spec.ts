import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelDefaultComponent } from './data-model-default.component';

describe('DataModelDefaultComponent', () => {
  let component: DataModelDefaultComponent;
  let fixture: ComponentFixture<DataModelDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataModelDefaultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
