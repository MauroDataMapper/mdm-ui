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
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { Title } from '@angular/platform-browser';
import { ApiPropertyEditableState, ApiPropertyEditType, propertyMetadata } from '@mdm/model/api-properties';
import { catchError, map } from 'rxjs/operators';
import { GridService } from '@mdm/services';
import { ApiPropertyTableViewChange } from '../api-property-table/api-property-table.component';
import { ApiPropertyIndexResponse } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  activeTab: any;
  apiProperties: ApiPropertyEditableState[] = [];
  apiPropertyCategories: string[] = [];
  indexingStatus: string;
  indexingTime: string;

  constructor(
    private resources: MdmResourcesService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private messageHandler: MessageHandlerService,
    private title: Title,
    private gridService: GridService
  ) {}

  ngOnInit() {
    this.getApiProperties();
    this.activeTab = this.getTabDetailByName(this.uiRouterGlobals.params.tabView as string);
    this.indexingStatus = '';
    this.title.setTitle('Configuration');
  }

  getApiProperties(
    category?: string,
    sortBy?: string,
    sortType?: string) {
    const options = this.gridService.constructOptions(null, null, sortBy, sortType, null);

    this.resources.apiProperties
      .list(options)
      .pipe(
        map((response: ApiPropertyIndexResponse) => {
          return response.body.items.map<ApiPropertyEditableState>(item => {
            let metadata = propertyMetadata.find(m => m.key === item.key);
            if (!metadata) {
              metadata = {
                key: item.key,
                category: item.category,
                editType: ApiPropertyEditType.Value,
                isSystem: false,
                publiclyVisible: item.publiclyVisible
              };
            }

            return {
              metadata,
              original: item
            };
          });
        }),
        catchError(errors => {
          this.messageHandler.showError('There was a problem getting the configuration properties.', errors);
          return [];
        })
      )
      .subscribe((data: ApiPropertyEditableState[]) => {
        if (category) {
          this.apiProperties = data.filter(p => p.metadata.category === category);
          return;
        }

        this.apiProperties = data;

        const backendCategories = data
          .map(prop => prop.metadata.category)
          .filter(cat => cat && cat.length > 0);

        const knownCategories = propertyMetadata
          .map(prop => prop.category);

        this.apiPropertyCategories = [...new Set(backendCategories.concat(knownCategories).sort())];
      });
  }

  apiPropertiesViewChange(change: ApiPropertyTableViewChange) {
    this.getApiProperties(change.category, change.sortBy, change.sortType);
  }

  tabSelected(itemsName) {
    const tab = this.getTabDetail(itemsName);
    this.stateHandler.Go('configuration', { tabView: tab.name }, { notify: false, location: tab.index !== 0 });
  }

  getTabDetail(tabIndex) {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'properties' };
      case 2:
        return { index: 1, name: 'lucene' };
      default:
        return { index: 0, name: 'properties' };
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'properties':
        return { index: 0, name: 'properties' };
      case 'lucene':
        return { index: 2, name: 'lucene' };
      default:
        return { index: 0, name: 'properties' };
    }
  }

  rebuildIndex() {
    this.indexingStatus = 'start';

    this.resources.admin.rebuildLuceneIndexes(null).subscribe(() => {
        this.indexingStatus = 'success';
      },
      error => {
        if (error.status === 418) {
          this.indexingStatus = 'success';
          if (error.error && error.error.timeTaken) {
            this.indexingTime = `in ${error.error.timeTaken}`;
          }
        } else {
          this.indexingStatus = 'error';
        }
    });
  }
}
