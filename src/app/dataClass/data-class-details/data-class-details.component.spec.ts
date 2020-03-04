import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataClassDetailsComponent } from './data-class-details.component';

describe('DataClassDetailsComponent', () => {
  let component: DataClassDetailsComponent;
  let fixture: ComponentFixture<DataClassDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataClassDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataClassDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
