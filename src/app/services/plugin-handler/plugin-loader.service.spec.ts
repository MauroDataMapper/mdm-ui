import { TestBed } from '@angular/core/testing';

import { PluginLoaderService } from './plugin-loader.service';

describe('PluginLoaderService', () => {
  let service: PluginLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PluginLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
