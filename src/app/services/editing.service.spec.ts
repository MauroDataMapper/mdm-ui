import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog'
import { EditingService } from './editing.service';

describe('EditingService', () => {
  let service: EditingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ]
    });
    service = TestBed.inject(EditingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
