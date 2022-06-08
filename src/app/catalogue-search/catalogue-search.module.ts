/*
Copyright 2020-2022 University of Oxford
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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@mdm/modules/shared/shared.module';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { CatalogueSearchComponent } from './catalogue-search/catalogue-search.component';
import { CatalogueSearchListingComponent } from './catalogue-search-listing/catalogue-search-listing.component';
import { CatalogueItemSearchResultComponent } from './catalogue-item-search-result/catalogue-item-search-result.component';
import { CatalogueModule } from '@mdm/modules/catalogue/catalogue.module';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

@NgModule({
  declarations: [
    CatalogueSearchComponent,
    CatalogueSearchListingComponent,
    CatalogueItemSearchResultComponent,
    BreadcrumbComponent
  ],
  imports: [CommonModule, SharedModule, MaterialModule, CatalogueModule]
})
export class CatalogueSearchModule {}
