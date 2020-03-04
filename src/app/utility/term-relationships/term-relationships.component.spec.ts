import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermRelationshipsComponent } from './term-relationships.component';

describe('TermRelationshipsComponent', () => {
  let component: TermRelationshipsComponent;
  let fixture: ComponentFixture<TermRelationshipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermRelationshipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermRelationshipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
