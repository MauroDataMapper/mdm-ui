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
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CatalogueItemSearchResult } from '@maurodatamapper/mdm-resources';
import { ElementTypesService } from '@mdm/services';

@Component({
  selector: 'mdm-catalogue-item-search-result',
  templateUrl: './catalogue-item-search-result.component.html',
  styleUrls: ['./catalogue-item-search-result.component.scss']
})
export class CatalogueItemSearchResultComponent implements OnChanges {
  @Input() item?: CatalogueItemSearchResult;

  @Input() showBreadcrumb = false;

  linkUrl = '';

  constructor(private elementTypes: ElementTypesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.linkUrl = this.elementTypes.getLinkUrl(this.item);
    }
  }
}
