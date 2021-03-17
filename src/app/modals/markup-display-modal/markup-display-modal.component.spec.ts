import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkupDisplayModalComponent } from './markup-display-modal.component';

describe('MarkupDisplayModalComponent', () => {
  let component: MarkupDisplayModalComponent;
  let fixture: ComponentFixture<MarkupDisplayModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkupDisplayModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkupDisplayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
