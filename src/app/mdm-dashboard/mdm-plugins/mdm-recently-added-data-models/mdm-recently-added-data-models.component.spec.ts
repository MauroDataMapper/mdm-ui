import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdmRecentlyAddedDataModelsComponent } from './mdm-recently-added-data-models.component';

describe('MdmRecentlyAddedDataModelsComponent', () => {
  let component: MdmRecentlyAddedDataModelsComponent;
  let fixture: ComponentFixture<MdmRecentlyAddedDataModelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdmRecentlyAddedDataModelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdmRecentlyAddedDataModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
