import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataElementMainComponent } from './data-element-main.component';

describe('DataElementMainComponent', () => {
  let component: DataElementMainComponent;
  let fixture: ComponentFixture<DataElementMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataElementMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataElementMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
