/*
Copyright 2020-2023 University of Oxford
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
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { StateHandlerService } from '@mdm/services';
import { CatalogueSearchAdvancedFormComponent } from '../catalogue-search-advanced/catalogue-search-advanced-form.component';
import { CatalogueSearchFormComponent } from '../catalogue-search-form/catalogue-search-form.component';

@Component({
  selector: 'mdm-catalogue-search',
  templateUrl: './catalogue-search.component.html',
  styleUrls: ['./catalogue-search.component.scss']
})
export class CatalogueSearchComponent implements OnInit {
  constructor(private stateHandler: StateHandlerService) {}

  @ViewChild(CatalogueSearchFormComponent, { static: true })
  catalogueSearchFormComponent: CatalogueSearchFormComponent;
  @ViewChild(CatalogueSearchAdvancedFormComponent, { static: true })
  catalogueSearchAdvancedFormComponent: CatalogueSearchAdvancedFormComponent;

  ngOnInit(): void {}

  reset() {
    this.catalogueSearchFormComponent.reset();
    this.catalogueSearchAdvancedFormComponent.reset();
  }

  search() {
    const context: MdmTreeItem | undefined | null = this
      .catalogueSearchAdvancedFormComponent.context.value?.[0];

    this.stateHandler.Go('appContainer.mainApp.catalogueSearchListing', {
      contextDomainType: context?.domainType ?? null,
      contextId: context?.id ?? null,
      contextLabel: context?.label ?? null,
      contextParentId: context?.parentId ?? null,
      contextDataModelId: context?.modelId ?? null,

      search: this.catalogueSearchFormComponent.searchTerms.value,

      labelOnly: this.catalogueSearchAdvancedFormComponent.labelOnly.value,
      exactMatch: this.catalogueSearchAdvancedFormComponent.exactMatch.value,
      domainTypes: this.catalogueSearchAdvancedFormComponent.domainTypes.value,

      classifiers: this.catalogueSearchAdvancedFormComponent.classifierNames,

      lastUpdatedAfter:
        this.catalogueSearchAdvancedFormComponent.formatDate(
          this.catalogueSearchAdvancedFormComponent.lastUpdatedAfter.value
        ) ?? null,

      lastUpdatedBefore:
        this.catalogueSearchAdvancedFormComponent.formatDate(
          this.catalogueSearchAdvancedFormComponent.lastUpdatedBefore.value
        ) ?? null,

      createdAfter:
        this.catalogueSearchAdvancedFormComponent.formatDate(
          this.catalogueSearchAdvancedFormComponent.createdAfter.value
        ) ?? null,

      createdBefore:
        this.catalogueSearchAdvancedFormComponent.formatDate(
          this.catalogueSearchAdvancedFormComponent.createdBefore.value
        ) ?? null
    });
  }
}
