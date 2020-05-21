import { TestBed } from '@angular/core/testing';

import { CustomHtmlRendererService } from './custom-html-renderer.service';

describe('CustomHtmlRendererService', () => {
  let service: CustomHtmlRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomHtmlRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
