import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenidConnectProviderComponent } from './openid-connect-provider.component';

describe('OpenidConnectProviderComponent', () => {
  let component: OpenidConnectProviderComponent;
  let fixture: ComponentFixture<OpenidConnectProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenidConnectProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenidConnectProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
