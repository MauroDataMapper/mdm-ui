import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilesDashboardComponent } from './profiles-dashboard.component';

describe('ProfilesDashboardComponent', () => {
  let component: ProfilesDashboardComponent;
  let fixture: ComponentFixture<ProfilesDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilesDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
