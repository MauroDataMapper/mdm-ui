/*
Copyright 2020-2025 University of Oxford and NHS England

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

import { Component, Input } from '@angular/core';
import { Profile } from '@maurodatamapper/mdm-resources';
import { MoreDescriptionComponent } from '../more-description/more-description.component';
import { FormsModule } from '@angular/forms';
import { ContentEditorComponent } from '../../content/content-editor/content-editor.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'mdm-profile-details',
    templateUrl: './profile-details.component.html',
    styleUrls: ['./profile-details.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, MatTooltip, ContentEditorComponent, FormsModule, MoreDescriptionComponent]
})
export class ProfileDetailsComponent {
  @Input() currentProfileDetails: Profile;

  readonly formOptionsMap = {
    integer: 'number',
    string: 'text',
    boolean: 'checkbox',
    int: 'number',
    date: 'date',
    time: 'time',
    datetime: 'datetime',
    decimal: 'number'
  };

  convertStringToJson(value: string) {
    return JSON.parse(value);
  }
}
