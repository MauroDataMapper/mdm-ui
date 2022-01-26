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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MultiFacetAwareItem, ProfileContext } from '@maurodatamapper/mdm-resources';
import { BulkEditContext, BulkEditProfileContext } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-editor-group',
  templateUrl: './bulk-edit-editor-group.component.html',
  styleUrls: ['./bulk-edit-editor-group.component.scss']
})
export class BulkEditEditorGroupComponent implements OnInit {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onPrevious = new EventEmitter<void>();
  @Output() onValidate = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<ProfileContext[]>();

  /** Two way binding */
  @Input() context: BulkEditContext;
  @Output() contextChanged = new EventEmitter<BulkEditContext>();

  tabs: BulkEditProfileContext[];

  ngOnInit(): void {
    this.tabs = this.context.profiles.map<BulkEditProfileContext>(profile => {
      const multiFacetAwareItems = this.context.elements.map<MultiFacetAwareItem>(element => {
        return {
          multiFacetAwareItemDomainType: element.domainType,
          multiFacetAwareItemId: element.id
        };
      });

      return {
        displayName: profile.displayName,
        profile,
        multiFacetAwareItems,
        editedProfiles: null
      };
    });
  }

  cancel() {
    this.onCancel.emit();
  }

  previous() {
    this.onPrevious.emit();
  }

  validate() {
    this.onValidate.emit();
  }

  save() {
    const profiles: ProfileContext[] = [];
    this.tabs.forEach((tab) => {
      profiles.push(...tab.editedProfiles.profilesProvided);
    });

    this.onSave.emit(profiles);
  }
}
