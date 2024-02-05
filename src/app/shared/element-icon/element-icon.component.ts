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
import {
  CatalogueItem,
  CatalogueItemDomainType,
  DataModelDetail
} from '@maurodatamapper/mdm-resources';
import { getCatalogueItemDomainTypeIcon } from '@mdm/folders-tree/flat-node';

@Component({
  selector: 'mdm-element-icon',
  templateUrl: './element-icon.component.html',
  styleUrls: ['./element-icon.component.sass']
})
export class ElementIconComponent implements OnChanges {
  @Input() element: CatalogueItem;

  icon: string;
  name: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.element) {
      this.icon = this.getIcon();
      this.name = this.getName();
    }
  }

  private getIcon() {
    if (this.element.domainType === CatalogueItemDomainType.DataModel) {
      const dataModel = this.element as DataModelDetail;
      return dataModel?.type === 'Data Standard'
        ? 'fa-file-alt'
        : 'fa-database';
    }

    return getCatalogueItemDomainTypeIcon(this.element.domainType);
  }

  private getName() {
    switch (this.element.domainType) {
      case CatalogueItemDomainType.Classifier:
        return 'Classifier';
      case CatalogueItemDomainType.CodeSet:
        return 'Code Set';
      case CatalogueItemDomainType.DataClass:
        return 'Data Class';
      case CatalogueItemDomainType.DataElement:
        return 'Data Element';
      case CatalogueItemDomainType.DataModel: {
        const dataModel = this.element as DataModelDetail;
        return dataModel?.type === 'Data Standard'
          ? 'Data Standard'
          : 'Data Asset';
      }
      case CatalogueItemDomainType.EnumerationType:
      case CatalogueItemDomainType.ModelDataType:
      case CatalogueItemDomainType.PrimitiveType:
        return 'Data Type';
      case CatalogueItemDomainType.FederatedDataModel:
        return 'Federated Data Model';
      case CatalogueItemDomainType.Folder:
        return 'Folder';
      case CatalogueItemDomainType.ReferenceDataModel:
        return 'Reference Data Model';
      case CatalogueItemDomainType.ReferenceDataModelType:
      case CatalogueItemDomainType.ReferenceEnumerationType:
      case CatalogueItemDomainType.ReferencePrimitiveType:
        return 'Reference Data Type';
      case CatalogueItemDomainType.SubscribedCatalogue:
        return 'Subscribed Catalogue';
      case CatalogueItemDomainType.Term:
        return 'Term';
      case CatalogueItemDomainType.Terminology:
        return 'Terminology';
      case CatalogueItemDomainType.VersionedFolder:
        return 'Versioned Folder';
    }
  }
}
