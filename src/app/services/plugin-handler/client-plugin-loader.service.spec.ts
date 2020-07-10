import { TestBed } from '@angular/core/testing';

import { ClientPluginLoaderService } from './client-plugin-loader.service';

describe('ClientPluginLoaderService', () => {
  let service: ClientPluginLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientPluginLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
