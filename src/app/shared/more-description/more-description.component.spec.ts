import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreDescriptionComponent } from './more-description.component';

describe('MoreDescriptionComponent', () => {
  let component: MoreDescriptionComponent;
  let fixture: ComponentFixture<MoreDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoreDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
