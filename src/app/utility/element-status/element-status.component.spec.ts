import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementStatusComponent } from './element-status.component';

describe('ElementStatusComponent', () => {
  let component: ElementStatusComponent;
  let fixture: ComponentFixture<ElementStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
