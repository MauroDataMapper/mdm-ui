import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFiltersComponent } from './profile-filters.component';

describe('ProfileFiltersComponent', () => {
  let component: ProfileFiltersComponent;
  let fixture: ComponentFixture<ProfileFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileFiltersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
