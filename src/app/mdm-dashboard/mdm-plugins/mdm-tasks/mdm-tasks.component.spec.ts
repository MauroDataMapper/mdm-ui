import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdmTasksComponent } from './mdm-tasks.component';

describe('MdmTasksComponent', () => {
  let component: MdmTasksComponent;
  let fixture: ComponentFixture<MdmTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdmTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdmTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
