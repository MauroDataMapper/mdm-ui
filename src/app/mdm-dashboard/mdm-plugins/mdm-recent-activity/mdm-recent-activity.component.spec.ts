import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdmRecentActivityComponent } from './mdm-recent-activity.component';

describe('MdmRecentActivityComponent', () => {
  let component: MdmRecentActivityComponent;
  let fixture: ComponentFixture<MdmRecentActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdmRecentActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdmRecentActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
