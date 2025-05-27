/*
Copyright 2020-2024 University of Oxford and NHS England

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

import { Component, Input, OnInit } from '@angular/core';
import { CatalogueItem } from '@maurodatamapper/mdm-resources';

import { DefaultProfileControls } from '@mdm/model/defaultProfileModel';
import { ElementClassificationsComponent } from '../../utility/element-classifications/element-classifications.component';
import { ElementDataTypeComponent } from '../element-data-type/element-data-type.component';
import { ElementLinkComponent } from '../../utility/element-link/element-link.component';
import { MultiplicityComponent } from '../multiplicity/multiplicity.component';
import { ContentEditorComponent } from '../../content/content-editor/content-editor.component';
import { ElementAliasComponent } from '../../utility/element-alias/element-alias.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineTextEditComponent } from '../inline-text-edit/inline-text-edit.component';
import { ElementDataTypeDetailsComponent } from '../element-data-type-details/element-data-type-details.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'mdm-default-profile',
    templateUrl: './default-profile.component.html',
    standalone: true,
    imports: [
      NgIf,
      ElementDataTypeDetailsComponent,
      InlineTextEditComponent,
      FormsModule,
      ElementAliasComponent,
      ContentEditorComponent,
      MultiplicityComponent,
      ElementLinkComponent,
      ElementDataTypeComponent,
      ElementClassificationsComponent,
      ReactiveFormsModule]
})
export class DefaultProfileComponent implements OnInit {
  @Input() catalogueItem: CatalogueItem & { [key: string]: any };

  controls: Array<string>;

  constructor() {}

  ngOnInit(): void {
    this.controls = DefaultProfileControls.renderControls(
      this.catalogueItem.domainType
    );
  }

  isInControlList(control: string): boolean {
    return this.controls.findIndex((x) => x === control) !== -1;
  }
}
