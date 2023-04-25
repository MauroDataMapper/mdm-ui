import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFilterCardComponent } from './profile-filter-card.component';

describe('ProfileFilterCardComponent', () => {
  let component: ProfileFilterCardComponent;
  let fixture: ComponentFixture<ProfileFilterCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileFilterCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileFilterCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
