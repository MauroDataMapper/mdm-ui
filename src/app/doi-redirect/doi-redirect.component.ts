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
import { Component, OnInit } from '@angular/core';
import { CatalogueItemDomainType, DataClass, DataElement, DataType, DoiResolvedItem, DoiResolvedItemResponse, isDataType, Term } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'mdm-doi-redirect',
  templateUrl: './doi-redirect.component.html',
  styleUrls: ['./doi-redirect.component.scss']
})
export class DoiRedirectComponent implements OnInit {
  identifier: string;
  resolving = true;
  errorMessage: string;

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService) { }

  ngOnInit(): void {
    this.identifier = this.uiRouterGlobals.params.id;
    if (!this.identifier) {
      this.stateHandler.Go('home');
      return;
    }

    this.resources.pluginDoi
      .resolve(this.identifier)
      .pipe(
        catchError(error => {
          this.errorMessage = error;
          return EMPTY;
        }),
        finalize(() => this.resolving = false)
      )
      .subscribe((response: DoiResolvedItemResponse) => {
        this.redirectToItem(response.body);
      });
  }

  private redirectToItem(item: DoiResolvedItem) {
    const params: any = {
      id: item.id
    };

    let state: string = item.domainType;

    if (item.domainType === CatalogueItemDomainType.DataClass) {
      const dataClass = item as DataClass;
      params.dataModelId = dataClass.model;
      params.dataClassId = dataClass.dataClass ?? '';
    }
    else if (item.domainType === CatalogueItemDomainType.DataElement) {
      const dataElement = item as DataElement;
      params.dataModelId = dataElement.model;
      params.dataClassId = dataElement.dataClass;
    }
    else if (isDataType(item.domainType)) {
      const dataType = item as DataType;
      params.dataModelId = dataType.model;
      state = 'appContainer.mainApp.twoSidePanel.catalogue.dataType';
    }
    else if (item.domainType === CatalogueItemDomainType.Term) {
      const term = item as Term;
      params.terminologyId = term.model;
    }

    this.stateHandler
      .Go(state, params)
      .catch(error => {
        this.errorMessage = `Unable to redirect to ${item.domainType} ${item.id}. ${error}`;
      });
  }

}
