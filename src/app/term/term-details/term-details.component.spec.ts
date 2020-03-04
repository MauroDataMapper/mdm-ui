import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermDetailsComponent } from './term-details.component';

describe('TermDetailsComponent', () => {
  let component: TermDetailsComponent;
  let fixture: ComponentFixture<TermDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
