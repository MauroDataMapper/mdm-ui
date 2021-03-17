/* eslint-disable id-blacklist */
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MarkupDisplayModalComponent } from '@mdm/modals/markup-display-modal/markup-display-modal.component';

@Component({
  selector: 'mdm-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit {
  @Input() currentProfileDetails: any;

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

  ngOnInit(): void {}

  showInfo(field: any) {
    this.dialog.open(MarkupDisplayModalComponent, {
      data: {
        content: field.description,
        title: field.fieldName
      }
    });
  }
}
