import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MdmFavouritesComponent } from './mdm-favourites.component';

describe('MdmFavouritesComponent', () => {
  let component: MdmFavouritesComponent;
  let fixture: ComponentFixture<MdmFavouritesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MdmFavouritesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdmFavouritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
