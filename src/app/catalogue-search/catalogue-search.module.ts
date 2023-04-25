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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@mdm/shared/shared.module';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { CatalogueSearchComponent } from './catalogue-search/catalogue-search.component';
import { CatalogueSearchFormComponent } from './catalogue-search-form/catalogue-search-form.component';
import { CatalogueSearchListingComponent } from './catalogue-search-listing/catalogue-search-listing.component';
import { CatalogueItemSearchResultComponent } from './catalogue-item-search-result/catalogue-item-search-result.component';
import { CatalogueSearchAdvancedFormComponent } from './catalogue-search-advanced/catalogue-search-advanced-form.component';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { CatalogueItemSearchComponent } from './catalogue-item-search/catalogue-item-search.component';
import { CatalogueSearchProfileFilterListComponent } from './catalogue-search-profile-filter-list/catalogue-search-profile-filter-list.component';
import { ProfileFilterCardComponent } from './profile-filter-card/profile-filter-card.component';
import { ProfileFiltersComponent } from './profile-filters/profile-filters.component';
import { ProfileFilterDialogComponent } from './profile-filter-dialog-component/profile-filter-dialog-component';

@NgModule({
  declarations: [
    CatalogueSearchComponent,
    CatalogueSearchFormComponent,
    CatalogueSearchListingComponent,
    CatalogueItemSearchResultComponent,
    CatalogueSearchAdvancedFormComponent,
    SearchFiltersComponent,
    CatalogueItemSearchComponent,
    CatalogueSearchProfileFilterListComponent,
    ProfileFilterCardComponent,
    ProfileFiltersComponent,
    ProfileFilterDialogComponent
  ],
  imports: [
    CommonModule,
    FoldersTreeModule,
    SharedModule,
    MaterialModule,
    FoldersTreeModule
  ],
  exports: [CatalogueItemSearchComponent]
})
export class CatalogueSearchModule {}
