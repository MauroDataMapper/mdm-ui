import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolveMergeConflictModalComponent } from './resolve-merge-conflict-modal.component';

describe('ResolveMergeConflictModalComponent', () => {
  let component: ResolveMergeConflictModalComponent;
  let fixture: ComponentFixture<ResolveMergeConflictModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResolveMergeConflictModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResolveMergeConflictModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
