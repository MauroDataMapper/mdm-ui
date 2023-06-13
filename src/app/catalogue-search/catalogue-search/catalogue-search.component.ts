/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { StateHandlerService } from '@mdm/services';
import { CatalogueSearchAdvancedFormComponent } from '../catalogue-search-advanced/catalogue-search-advanced-form.component';
import { CatalogueSearchFormComponent } from '../catalogue-search-form/catalogue-search-form.component';
import { CatalogueSearchProfileFilterListComponent } from '../catalogue-search-profile-filter-list/catalogue-search-profile-filter-list.component';
import {
  CatalogueSearchContext,
  CatalogueSearchParameters,
  mapProfileFiltersToDto,
  mapSearchParametersToRawParams
} from '../catalogue-search.types';

@Component({
  selector: 'mdm-catalogue-search',
  templateUrl: './catalogue-search.component.html',
  styleUrls: ['./catalogue-search.component.scss']
})
export class CatalogueSearchComponent implements AfterViewInit {
  constructor(private stateHandler: StateHandlerService) {}

  @ViewChild(CatalogueSearchFormComponent)
  searchForm: CatalogueSearchFormComponent;

  @ViewChild(CatalogueSearchAdvancedFormComponent)
  advancedForm: CatalogueSearchAdvancedFormComponent;

  @ViewChild(CatalogueSearchProfileFilterListComponent)
  profileFiltersForm: CatalogueSearchProfileFilterListComponent;

  showMore = false;
  valid = false;

  ngAfterViewInit(): void {
    // Avoid an "ExpressionChangedAfterItHasBeenCheckedError"
    setTimeout(() => this.setValid());
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
  }

  onValueChange() {
    this.setValid();
  }

  reset() {
    this.searchForm.reset();

    // These two forms may or may not be bound depending on visibility
    this.advancedForm?.reset();
    this.profileFiltersForm?.reset();
  }

  search() {
    if (!this.valid) {
      return;
    }

    const context: MdmTreeItem | undefined | null = this.advancedForm?.context
      ?.value?.[0];

    const searchContext: CatalogueSearchContext | undefined = context
      ? {
          domainType: context.domainType,
          id: context.id,
          label: context.label,
          parentId: context.parentId,
          dataModelId: context.modelId
        }
      : undefined;

    const profileFilters = this.profileFiltersForm?.mapToProfileFilters();

    const parameters: CatalogueSearchParameters = {
      search: this.searchForm.searchTerms.value,

      // Default search to "labelOnly" check if no explicit value provided
      labelOnly: this.advancedForm?.labelOnly?.value ?? true,

      context: searchContext,

      ...(this.advancedForm && {
        exactMatch: this.advancedForm.exactMatch.value,
        domainTypes: this.advancedForm.domainTypes.value,

        classifiers: this.advancedForm.classifierNames,

        lastUpdatedAfter: this.advancedForm.lastUpdatedAfter.value,
        lastUpdatedBefore: this.advancedForm.lastUpdatedBefore.value,
        createdAfter: this.advancedForm.createdAfter.value,
        createdBefore: this.advancedForm.createdBefore.value,
        supercededDocuments: this.advancedForm.supercededDocuments.value
      }),

      ...(profileFilters && {
        profileFiltersDto: mapProfileFiltersToDto(profileFilters)
      })
    };

    const routeParams = mapSearchParametersToRawParams(parameters);
    this.stateHandler.Go(
      'appContainer.mainApp.catalogueSearchListing',
      routeParams
    );
  }

  private setValid() {
    this.valid =
      this.searchForm.formGroup.valid &&
      (this.advancedForm?.formGroup?.valid ?? true) &&
      (this.profileFiltersForm?.formGroup?.valid ?? true);
  }
}
