import { TestBed } from '@angular/core/testing';

import { CustomTokenizerService } from './custom-tokenizer.service';

describe('CustomTokenizerService', () => {
  let service: CustomTokenizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomTokenizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
