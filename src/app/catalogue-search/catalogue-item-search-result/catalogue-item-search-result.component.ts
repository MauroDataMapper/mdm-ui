/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { CatalogueItemSearchResult, MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { ElementTypesService } from '@mdm/services';
import { MoreDescriptionComponent } from '../../shared/more-description/more-description.component';
import { LocationPathComponent } from '../../shared/location-path/location-path.component';
import { PathNameService } from '../../shared/path-name/path-name.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'mdm-catalogue-item-search-result',
    templateUrl: './catalogue-item-search-result.component.html',
    styleUrls: ['./catalogue-item-search-result.component.scss'],
    standalone: true,
    imports: [NgIf, LocationPathComponent, MoreDescriptionComponent]
})
export class CatalogueItemSearchResultComponent implements OnChanges {
  @Input() item?: CatalogueItemSearchResult;

  @Input() showBreadcrumb = false;

  linkUrl = '';
  ancestorTreeItems: MdmTreeItem[] = [];

  constructor(
    private elementTypes: ElementTypesService,
    private pathName: PathNameService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.linkUrl = this.elementTypes.getLinkUrl(this.item);
      this.ancestorTreeItems = this.item?.breadcrumbs?.map((crumb, index) => {
        const crumbPath = (crumb as { path?: string }).path;
        const path = crumbPath
          ? crumbPath
          : this.pathName.createFromBreadcrumbs({
            id: crumb.id,
            domainType: crumb.domainType,
            label: crumb.label,
            branchName: crumb.branchName,
            modelVersionTag: crumb.modelVersionTag,
            modelVersion: crumb.modelVersion,
            breadcrumbs: this.item.breadcrumbs.slice(0, index)
          } as any);

        return {
          ...crumb,
          path
        } as MdmTreeItem;
      }) ?? [];
    }
  }
}
