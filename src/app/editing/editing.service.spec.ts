import { TestBed } from '@angular/core/testing';

import { EditingService } from './editing.service';

describe('EditingService', () => {
  let service: EditingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
