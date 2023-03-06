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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { StateHandlerService } from '@mdm/services';
import { CatalogueSearchAdvancedFormComponent } from '../catalogue-search-advanced/catalogue-search-advanced-form.component';
import { CatalogueSearchFormComponent } from '../catalogue-search-form/catalogue-search-form.component';
import { CatalogueSearchProfileFilterListComponent } from '../catalogue-search-profile-filter-list/catalogue-search-profile-filter-list.component';

@Component({
  selector: 'mdm-catalogue-search',
  templateUrl: './catalogue-search.component.html',
  styleUrls: ['./catalogue-search.component.scss']
})
export class CatalogueSearchComponent implements OnInit, AfterViewInit {
  constructor(private stateHandler: StateHandlerService) {}

  @ViewChild(CatalogueSearchFormComponent)
  searchForm: CatalogueSearchFormComponent;

  @ViewChild(CatalogueSearchAdvancedFormComponent)
  advancedForm: CatalogueSearchAdvancedFormComponent;

  @ViewChild(CatalogueSearchProfileFilterListComponent)
  profileFiltersForm: CatalogueSearchProfileFilterListComponent;

  showMore = false;
  valid = false;

  ngOnInit(): void {}

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

    // TODO: include profile filters to redirect URL

    this.stateHandler.Go('appContainer.mainApp.catalogueSearchListing', {
      search: this.searchForm.searchTerms.value,

      ...(context && {
        contextDomainType: context.domainType ?? null,
        contextId: context.id ?? null,
        contextLabel: context.label ?? null,
        contextParentId: context.parentId ?? null,
        contextDataModelId: context.modelId ?? null
      }),

      ...(this.advancedForm && {
        labelOnly: this.advancedForm.labelOnly.value,
        exactMatch: this.advancedForm.exactMatch.value,
        domainTypes: this.advancedForm.domainTypes.value,

        classifiers: this.advancedForm.classifierNames,

        lastUpdatedAfter:
          this.advancedForm.formatDate(
            this.advancedForm.lastUpdatedAfter.value
          ) ?? null,

        lastUpdatedBefore:
          this.advancedForm.formatDate(
            this.advancedForm.lastUpdatedBefore.value
          ) ?? null,

        createdAfter:
          this.advancedForm.formatDate(this.advancedForm.createdAfter.value) ??
          null,

        createdBefore:
          this.advancedForm.formatDate(this.advancedForm.createdBefore.value) ??
          null
      })
    });
  }

  private setValid() {
    this.valid =
      this.searchForm.formGroup.valid &&
      (this.advancedForm?.formGroup?.valid ?? true) &&
      (this.profileFiltersForm?.formGroup?.valid ?? true);
  }
}
