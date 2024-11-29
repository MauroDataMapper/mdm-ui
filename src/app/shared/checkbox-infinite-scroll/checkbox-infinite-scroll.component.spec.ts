import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxInfiniteScrollComponent } from './checkbox-infinite-scroll.component';

describe('CheckboxInfiniteScrollComponent', () => {
  let component: CheckboxInfiniteScrollComponent;
  let fixture: ComponentFixture<CheckboxInfiniteScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckboxInfiniteScrollComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckboxInfiniteScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
