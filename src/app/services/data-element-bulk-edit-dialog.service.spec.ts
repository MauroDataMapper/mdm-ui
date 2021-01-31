import { TestBed } from '@angular/core/testing';

import { DataElementBulkEditDialogService } from './data-element-bulk-edit-dialog.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('DataElementBulkEditDialogService', () => {
  let service: DataElementBulkEditDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ]
    });
    service = TestBed.inject(DataElementBulkEditDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
