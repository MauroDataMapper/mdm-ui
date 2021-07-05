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
import {
  BasicModelVersionItem,
  BasicModelVersionTreeResponse,
  CatalogueItem,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  ElementTypesService,
  MessageHandlerService,
  StateHandlerService
} from '@mdm/services';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'mdm-branch-selector',
  templateUrl: './branch-selector.component.html',
  styleUrls: ['./branch-selector.component.scss']
})
export class BranchSelectorComponent implements OnInit {
  @Input() catalogueItem: CatalogueItem;
  @Input() forMerge: boolean;
  @Input() disabled: boolean;
  @Output() selectedCatalogueItemChanged = new EventEmitter<Uuid>();

  versionList: BasicModelVersionItem[];
  currentVersionId: Uuid;

  constructor(
    private resources: MdmResourcesService,
    private elementTypes: ElementTypesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService
  ) {}

  ngOnInit(): void {
    this.currentVersionId = this.catalogueItem.id;
    this.disabled = this.disabled ?? false;

    const domainElementType = this.elementTypes.getBaseTypeForDomainType(
      this.catalogueItem.domainType
    );

    this.resources[domainElementType.resourceName]
      .simpleModelVersionTree(this.catalogueItem.id,{branchesOnly : this.forMerge})
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem fetching the branch list.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response: BasicModelVersionTreeResponse) => {
        this.versionList = response.body;
        this.versionList.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );
      });
  }

  currentVersionIdChanged() {
    if (this.forMerge) {
      this.selectedCatalogueItemChanged.emit(this.currentVersionId);
    } else {
      this.stateHandler.Go(
        this.catalogueItem.domainType,
        {
          id: this.currentVersionId
        },
        {
          reload: true,
          location: true
        }
      );
    }
  }
}
