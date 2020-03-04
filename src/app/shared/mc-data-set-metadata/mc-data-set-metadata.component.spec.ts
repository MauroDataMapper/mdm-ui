import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { McDataSetMetadataComponent } from './mc-data-set-metadata.component';

describe('McDataSetMetadataComponent', () => {
  let component: McDataSetMetadataComponent;
  let fixture: ComponentFixture<McDataSetMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ McDataSetMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McDataSetMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
