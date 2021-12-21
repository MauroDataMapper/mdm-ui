import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewerVersionsComponent } from './newer-versions.component';

describe('NewerVersionsComponent', () => {
  let component: NewerVersionsComponent;
  let fixture: ComponentFixture<NewerVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewerVersionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewerVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
