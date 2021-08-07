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
import { Component, OnInit, Input } from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { from, Observable } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';
import { Categories } from '@mdm/model/model-types.model';
import { CatalogueItem, CatalogueItemDomainType, DataType, MdmResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-element-data-type',
  templateUrl: './element-data-type.component.html',
  styleUrls: ['./element-data-type.component.sass']
})
export class ElementDataTypeComponent implements OnInit {
  @Input() elementDataType: DataType;
  @Input() hideName: boolean;
  @Input() onlyShowRefDataClass: boolean;
  @Input() hideEnumList: boolean;
  @Input() initiallyShowEnumList: boolean;
  @Input() mcParentDataModel: any;
  @Input() newWindow: boolean;
  @Input() showTypeName: boolean;

  showMoreIcon: boolean;
  showing = false;
  referenceClass: any;
  referenceClassLink: any;
  modelResource: CatalogueItem;
  link: any;
  categories: any[];
  allRecords: any[];
  enumsCount: number;
  hasCategory: boolean;
  allRecordsWithGroups: any[];

  // default values
  showCount = 5;
  toggleShowEnums = false;

  constructor(
    private stateHandler: StateHandlerService,
    private elementTypes: ElementTypesService,
    private resources: MdmResourcesService
  ) {}


  ngOnInit() {
    if (this.elementDataType !== null && this.elementDataType !== undefined) {
      let parentDataModelId = this.mcParentDataModel
        ? this.mcParentDataModel.id
        : null;
      if (!parentDataModelId) {
        parentDataModelId = this.elementDataType.model;
      }

      if (
        this.elementDataType.domainType === 'ReferenceType' &&
        this.elementDataType.referenceClass
      ) {
        this.referenceClass = this.elementDataType.referenceClass;
        this.referenceClassLink = this.stateHandler.getURL('dataclass', {
          id: this.elementDataType.referenceClass.id,
          dataModelId: parentDataModelId
        });
      }

      this.link = this.elementTypes.getLinkUrl(this.elementDataType);
    }

    if (this.elementDataType.domainType === CatalogueItemDomainType.ModelDataType) {
      this.loadModelResource();
    }

    if (this.elementDataType.enumerationValues) {
      if (
        this.elementDataType &&
        this.elementDataType.domainType === 'EnumerationType'
      ) {
        // Handle Category in enum
        // ...........................................................................
        this.categories = [];
        this.allRecords = [].concat(this.elementDataType.enumerationValues);
        this.enumsCount = this.allRecords.length;
        this.hasCategory = false;
        for (const element of this.allRecords) {
          if (element && element.category) {
            this.hasCategory = true;
            break;
          }
        }

        const categories = from(this.allRecords).pipe(
          groupBy(record => record.category),
          mergeMap(group => group.pipe(toArray()))
        );

        categories.subscribe((cats: Categories[]) => {
          const categoryNames = [];
          let hasEmptyCategory = false;

          cats.forEach(x => {
            if (x.category !== null) {
              categoryNames.push(x.category);
            } else {
              hasEmptyCategory = true;
            }
          });

          if (hasEmptyCategory) {
            categoryNames.push(null);
          }

          this.allRecordsWithGroups = [];
          categoryNames.forEach(category => {
            if (category !== null) {
              this.categories.push({ key: category, value: category });
            }

            this.allRecordsWithGroups.push({
              id: category !== null ? category : null,
              category: category !== null ? category : null,
              isCategoryRow: true
            });

            cats.filter(x => x.category === category)
              .forEach(row => {
                this.allRecordsWithGroups.push(row);
              });
          });
          // ...........................................................................

          if (this.allRecordsWithGroups.length > this.showCount) {
            this.showMoreIcon = true;
            this.showing = false;
          }
        });
      }
    }
  }

  showMore = (element: any) => {
    if (this.showMoreIcon && !this.showing) {
      const elements = element.parentElement.offsetParent.getElementsByClassName(
        'moreEnumerationKeyValue'
      );
      for (const elem of elements) {
        elem.classList.remove('hiddenMoreEnumerationKeyValue');
      }
      element.innerHTML = 'hide <i class=\'fas fa-caret-down fa-xs\'></i>';
    } else {
      const elements = element.parentElement.offsetParent.getElementsByClassName(
        'moreEnumerationKeyValue'
      );
      for (const elem of elements) {
        elem.classList.add('hiddenMoreEnumerationKeyValue');
      }
      element.innerHTML = '... more <i class=\'fas fa-caret-down fa-xs\'></i>';
    }
    this.showing = !this.showing;
  };

  showEnums = () => {
    this.toggleShowEnums = !this.toggleShowEnums;
  };

  private loadModelResource() {
    const id: Uuid = this.elementDataType.modelResourceId;
    const domainType: CatalogueItemDomainType = this.elementDataType.modelResourceDomainType;

    let request: Observable<MdmResponse<CatalogueItem>>;
    switch (domainType) {
      case CatalogueItemDomainType.ReferenceDataModel:
        request = this.resources.referenceDataModel.get(id);
        break;
      case CatalogueItemDomainType.CodeSet:
        request = this.resources.codeSet.get(id);
        break;
      case CatalogueItemDomainType.Terminology:
        request = this.resources.terminology.get(id);
        break;
    }

    if (!request) {
      return;
    }

    request.subscribe(response => this.modelResource = response.body);
  }
}
