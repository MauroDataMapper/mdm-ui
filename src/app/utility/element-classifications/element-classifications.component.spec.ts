import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementClassificationsComponent } from './element-classifications.component';

describe('ElementClassificationsComponent', () => {
  let component: ElementClassificationsComponent;
  let fixture: ComponentFixture<ElementClassificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementClassificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementClassificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
