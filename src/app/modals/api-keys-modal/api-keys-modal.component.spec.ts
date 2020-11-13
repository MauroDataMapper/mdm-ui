import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKeysModalComponent } from './api-keys-modal.component';

describe('ApiKeysModalComponent', () => {
  let component: ApiKeysModalComponent;
  let fixture: ComponentFixture<ApiKeysModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiKeysModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiKeysModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
