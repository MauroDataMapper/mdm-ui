import { TestBed } from '@angular/core/testing';

import { PropertyRenamingService } from './property-renaming.service';

describe('PropertyRenamingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PropertyRenamingService = TestBed.inject(PropertyRenamingService);
    expect(service).toBeTruthy();
  });
});
