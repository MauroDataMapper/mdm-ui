/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
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
        //field.dataType = field.dataType.toLowerCase();
      });
    });
  }
    this._currentProfileDetails = value;
  }

  formOptionsMap = {
    INTEGER: 'number',
    STRING: 'text',
    BOOLEAN: 'checkbox',
    INT: 'number',
    DATE: 'date',
    TIME: 'time',
    DATETIME: 'datetime',
    DECIMAL: 'number'
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
