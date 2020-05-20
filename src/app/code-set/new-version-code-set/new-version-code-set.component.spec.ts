import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVersionCodeSetComponent } from './new-version-code-set.component';

describe('NewVersionCodeSetComponent', () => {
  let component: NewVersionCodeSetComponent;
  let fixture: ComponentFixture<NewVersionCodeSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewVersionCodeSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewVersionCodeSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
