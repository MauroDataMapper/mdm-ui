import { TestBed } from '@angular/core/testing';

import { FavouriteHandlerService } from './favourite-handler.service';

describe('FavouriteHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FavouriteHandlerService = TestBed.get(FavouriteHandlerService);
    expect(service).toBeTruthy();
  });
});
