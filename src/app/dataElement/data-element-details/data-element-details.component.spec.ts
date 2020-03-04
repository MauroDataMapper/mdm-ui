import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataElementDetailsComponent } from './data-element-details.component';

describe('DataElementDetailsComponent', () => {
  let component: DataElementDetailsComponent;
  let fixture: ComponentFixture<DataElementDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataElementDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
