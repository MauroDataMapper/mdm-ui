import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataClassComponent } from './data-class.component';

describe('DataClassComponent', () => {
  let component: DataClassComponent;
  let fixture: ComponentFixture<DataClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
