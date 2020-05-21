import { TestBed } from '@angular/core/testing';

import { LinkCreatorService } from './link-creator.service';

describe('LinkCreatorService', () => {
  let service: LinkCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
