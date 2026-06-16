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
import {
  Branchable,
  CatalogueItem,
  CatalogueItemDomainType,
  DataModelDetail,
  Finalisable,
  Historical,
  MdmTreeItem,
  ModelableDetail,
  SecurableModel,
  Versionable
} from '@maurodatamapper/mdm-resources';
import { BranchSelectorComponent } from '../branch-selector/branch-selector.component';
import { MatTooltip } from '@angular/material/tooltip';
import { LocationPathComponent } from '../location-path/location-path.component';
import { NgIf, DatePipe } from '@angular/common';

export type CatalogueItemPropertiesType = CatalogueItem &
  Partial<ModelableDetail> &
  Partial<SecurableModel> &
  Partial<Finalisable> &
  Partial<Versionable> &
  Partial<Branchable> &
  Partial<Historical>;

@Component({
    selector: 'mdm-catalogue-item-properties',
    templateUrl: './catalogue-item-properties.component.html',
    styleUrls: ['./catalogue-item-properties.component.scss'],
    standalone: true,
    imports: [NgIf, LocationPathComponent, MatTooltip, BranchSelectorComponent, DatePipe]
})
export class CatalogueItemPropertiesComponent implements OnChanges {
  @Input() item: CatalogueItemPropertiesType;
  @Input() ancestorTreeItems: MdmTreeItem[] = [];

  itemType: string;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item) {
      this.setItemType();
    }
  }

  private setItemType() {
    if (this.item.domainType === CatalogueItemDomainType.DataModel) {
      const dataModel = this.item as DataModelDetail;
      this.itemType = dataModel.type;
      return;
    }

    switch (this.item.domainType) {
      case CatalogueItemDomainType.CodeSet:
        this.itemType = 'Code Set';
        break;
      case CatalogueItemDomainType.ReferenceDataModel:
        this.itemType = 'Reference Data Model';
        break;
      default:
        this.itemType = this.item.domainType;
        break;
    }
  }
}
