import { TestBed } from '@angular/core/testing';

import { ExportHandlerService } from './export-handler.service';

describe('ExportHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExportHandlerService = TestBed.get(ExportHandlerService);
    expect(service).toBeTruthy();
  });
});
