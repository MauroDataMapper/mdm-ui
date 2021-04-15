import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ToastrModule } from 'ngx-toastr';

import { ProfileBaseComponent } from './profile-base.component';

describe('ProfileBaseComponent', () => {
  let component: ProfileBaseComponent;
  let fixture: ComponentFixture<ProfileBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: MdmResourcesService, useValue: {} }
      ],
      declarations: [ ProfileBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
