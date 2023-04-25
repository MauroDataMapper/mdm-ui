import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFilterDialogComponent } from './profile-filter-dialog-component';

describe('ProfileFilterDialogComponent', () => {
  let component: ProfileFilterDialogComponent;
  let fixture: ComponentFixture<ProfileFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileFilterDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
