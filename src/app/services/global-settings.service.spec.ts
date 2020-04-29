import { TestBed } from '@angular/core/testing';

import { GlobalSettingsService } from './global-settings.service';

describe('GlobalSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalSettingsService = TestBed.inject(GlobalSettingsService);
    expect(service).toBeTruthy();
  });
});
