import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { McPagedListComponent } from './mc-paged-list.component';

describe('McPagedListComponent', () => {
  let component: McPagedListComponent;
  let fixture: ComponentFixture<McPagedListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ McPagedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McPagedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
