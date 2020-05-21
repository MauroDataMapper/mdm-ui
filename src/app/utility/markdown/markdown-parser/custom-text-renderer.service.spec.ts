import { TestBed } from '@angular/core/testing';

import { CustomTextRendererService } from './custom-text-renderer.service';

describe('CustomTextRendererService', () => {
  let service: CustomTextRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomTextRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
