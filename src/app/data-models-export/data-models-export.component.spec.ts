import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelsExportComponent } from './data-models-export.component';

describe('DataModelsExportComponent', () => {
  let component: DataModelsExportComponent;
  let fixture: ComponentFixture<DataModelsExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataModelsExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataModelsExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
