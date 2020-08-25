import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFolderModalComponent } from './new-folder-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ToastrModule } from 'ngx-toastr';
import { empty } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('NewFolderModalComponent', () => {
  let component: NewFolderModalComponent;
  let fixture: ComponentFixture<NewFolderModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MdmResourcesService,
          useValue: {
            userGroups: {
              list: () => {
                return empty();
              }
            }
          }
        }
      ],
      declarations: [ NewFolderModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFolderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
