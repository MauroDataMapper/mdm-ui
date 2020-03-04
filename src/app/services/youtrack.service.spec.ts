import { TestBed } from '@angular/core/testing';

import { YoutrackService } from './youtrack.service';

describe('YoutrackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YoutrackService = TestBed.get(YoutrackService);
    expect(service).toBeTruthy();
  });
});
