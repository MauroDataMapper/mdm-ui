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
import { Component, OnInit, Input } from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { Observable } from 'rxjs';
import { CatalogueItem, CatalogueItemDomainType, DataType, MdmResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-element-data-type-details',
  templateUrl: './element-data-type-details.component.html',
  styleUrls: ['./element-data-type-details.component.sass']
})
export class ElementDataTypeDetailsComponent implements OnInit {
  @Input() elementDataType: DataType;
  @Input() newWindow: boolean;

  modelResource: CatalogueItem;

  constructor(
    private stateHandler: StateHandlerService,
    private elementTypes: ElementTypesService,
    private resources: MdmResourcesService
  ) {}


  ngOnInit() {
    if (this.elementDataType.domainType === CatalogueItemDomainType.ModelDataType) {
      this.loadModelResource();
    }

  }

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
