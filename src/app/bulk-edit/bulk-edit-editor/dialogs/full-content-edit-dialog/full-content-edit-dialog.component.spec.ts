import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullContentEditDialogComponent } from './full-content-edit-dialog.component';

describe('FullContentEditDialogComponent', () => {
  let component: FullContentEditDialogComponent;
  let fixture: ComponentFixture<FullContentEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullContentEditDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullContentEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
