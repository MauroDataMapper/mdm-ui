import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllLinksInPagedListComponent } from './all-links-in-paged-list.component';

describe('AllLinksInPagedListComponent', () => {
  let component: AllLinksInPagedListComponent;
  let fixture: ComponentFixture<AllLinksInPagedListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllLinksInPagedListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllLinksInPagedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
