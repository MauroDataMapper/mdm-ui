/* eslint-disable id-blacklist */
import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MarkupDisplayModalComponent } from '@mdm/modals/markup-display-modal/markup-display-modal.component';

@Component({
  selector: 'mdm-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements AfterViewInit {
  _currentProfileDetails: any;

  get currentProfileDetails(): any {
    return this._currentProfileDetails;
  }

  @Input() set currentProfileDetails(value: any) {
    if(value.sections){
    value.sections.forEach((section) => {
      section.fields.forEach((field) => {
        field.dataType = field.dataType.toLowerCase();
      });
    });
  }
    this._currentProfileDetails = value;
  }

  formOptionsMap = {
    Integer: 'number',
    String: 'text',
    Boolean: 'checkbox',
    boolean: 'checkbox',
    int: 'number',
    date: 'date',
    time: 'time',
    datetime: 'datetime',
    decimal: 'number'
  };

  constructor(private dialog: MatDialog) {}

  ngAfterViewInit(): void {
  }

  showInfo(field: any) {
    this.dialog.open(MarkupDisplayModalComponent, {
      data: {
        content: field.description,
        title: field.fieldName
      }
    });
  }
}
