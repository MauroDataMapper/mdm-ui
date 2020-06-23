import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdmCommentsComponent } from './mdm-comments.component';

describe('MdmCommentsComponent', () => {
  let component: MdmCommentsComponent;
  let fixture: ComponentFixture<MdmCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdmCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdmCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
