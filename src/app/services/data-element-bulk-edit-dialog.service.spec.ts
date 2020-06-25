import { TestBed } from '@angular/core/testing';

import { DataElementBulkEditDialogService } from './data-element-bulk-edit-dialog.service';

describe('DataElementBulkEditDialogService', () => {
  let service: DataElementBulkEditDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataElementBulkEditDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
