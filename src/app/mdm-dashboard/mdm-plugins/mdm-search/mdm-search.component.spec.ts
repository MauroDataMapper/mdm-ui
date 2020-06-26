import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdmSearchComponent } from './mdm-search.component';

describe('MdmSearchComponent', () => {
  let component: MdmSearchComponent;
  let fixture: ComponentFixture<MdmSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdmSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdmSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
