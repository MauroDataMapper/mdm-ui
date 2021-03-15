import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextDiffComponent } from './text-diff.component';

describe('TextDiffComponent', () => {
  let component: TextDiffComponent;
  let fixture: ComponentFixture<TextDiffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextDiffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
