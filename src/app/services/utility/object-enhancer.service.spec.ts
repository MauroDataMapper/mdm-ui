import { TestBed } from '@angular/core/testing';

import { ObjectEnhancerService } from './object-enhancer.service';

describe('ObjectEnhancerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ObjectEnhancerService = TestBed.get(ObjectEnhancerService);
    expect(service).toBeTruthy();
  });
});
