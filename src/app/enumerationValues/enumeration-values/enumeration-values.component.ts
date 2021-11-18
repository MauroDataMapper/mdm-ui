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

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { DataTypeDetailResponse } from '@maurodatamapper/mdm-resources';
import { UIRouterGlobals } from '@uirouter/core';

@Component({
   selector: 'mdm-enumeration-values',
   templateUrl: './enumeration-values.component.html',
   styleUrls: ['./enumeration-values.component.scss']
})
export class EnumerationValuesComponent implements OnInit, AfterViewInit {
   @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
   tabView: any;
   activeTab: any;
   loadingData = false;
   parentDataModel: any;
   parentDataType: any;
   enumerationValues: any;
   currentEnumerationValue: any;
   id: any;
   label: any;
   breadCrumbs: any;
   parent: any;
   dataModelId: string;
   element = {
      availableActions: [],
      id: '',
      breadcrumbs: [],
      domainType: '',
      label: '',
      model: ''
   };

   constructor(
      private stateHandler: StateHandlerService,
      private uiRouterGlobals: UIRouterGlobals,
      private resource: MdmResourcesService,
      private title: Title
   ) { }

   ngOnInit(): void {
   }

   async ngAfterViewInit() {
       this.parentDataModel = this.uiRouterGlobals.params.dataModelId;
      this.parentDataType = this.uiRouterGlobals.params.dataTypeId;
        this.id = this.uiRouterGlobals.params.id;

      await this.resource.dataType.get(this.parentDataModel, this.parentDataType).subscribe((result: DataTypeDetailResponse) => {
         this.breadCrumbs = result.body.breadcrumbs;
         this.dataModelId = result.body.model;

         this.element.availableActions = result.body.availableActions;
         this.element.breadcrumbs = result.body.breadcrumbs;
         this.element.domainType = result.body.domainType;
         this.element.model = result.body.model;
         this.element.label = result.body.label;
         this.element.id = result.body.id;

         this.parent = result.body;

         this.resource.enumerationValues.getFromDataType(this.parentDataModel, this.parentDataType, this.id).subscribe(res => {
            if (res !== null && res !== undefined && res.body !== null && res.body !== undefined) {
               this.label = res.body.value;
               this.currentEnumerationValue = res.body;
               this.parent = result.body;
               this.parent.id = res.body.id;
               this.title.setTitle(`Enumeration Value - ${this.label}`);

            }
         });
      });
      this.tabGroup.realignInkBar();
      // tslint:disable-next-line: deprecation
      this.activeTab = this.getTabDetailByName(this.uiRouterGlobals.params.tabView).index;
      this.tabSelected(this.activeTab);
   }

   tabSelected(index) {
      const tab = this.getTabDetailByIndex(index);
      this.stateHandler.Go('enumerationValues', { tabView: tab.name }, { notify: false });
      this.activeTab = tab.index;
    }

   getTabDetailByName(tabName) {
      switch (tabName) {
        case 'properties':
          return { index: 0, name: 'properties' };
        case 'comments':
          return { index: 1, name: 'comments' };
        case 'links':
          return { index: 2, name: 'links' };
      case 'attachments':
          return { index: 3, name: 'attachments' };
        default:
          return { index: 0, name: 'properties' };
      }
    }

    getTabDetailByIndex(index) {
      switch (index) {
        case 0:
          return { index: 0, name: 'properties' };
        case 1:
          return { index: 1, name: 'comments' };
        case 2:
          return { index: 2, name: 'links' };
        case 3:
          return { index: 3, name: 'attachments' };
        default:
          return { index: 0, name: 'properties' };
      }
    }

}
