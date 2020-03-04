import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementAliasComponent } from './element-alias.component';

describe('ElementAliasComponent', () => {
  let component: ElementAliasComponent;
  let fixture: ComponentFixture<ElementAliasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementAliasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementAliasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
