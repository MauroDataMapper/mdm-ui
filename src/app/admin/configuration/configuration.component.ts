/*
Copyright 2020 University of Oxford

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
import { ApiPropertyEditableState, ApiPropertyGroup, ApiPropertyIndexResponse, propertyMetadata } from '@mdm/model/api-properties';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'mdm-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  activeTab: any;
  emailTemplateApiProperties: ApiPropertyEditableState[] = [];
  indexingStatus: string;
  indexingTime: string;

  constructor(
    private resources: MdmResourcesService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private messageHandler: MessageHandlerService,
    private title: Title
  ) {}

  ngOnInit() {
    this.getApiProperties();
    this.activeTab = this.getTabDetailByName(this.uiRouterGlobals.params.tabView);
    this.indexingStatus = '';
    this.title.setTitle('Configuration');
  }

  getApiProperties() {
    this.resources.apiProperties
      .list()
      .pipe(
        map((response: ApiPropertyIndexResponse) => {
          return propertyMetadata.map<ApiPropertyEditableState>(metadata => {
            return {
              metadata,
              original: response.body.items?.find(p => p.key === metadata.key)
            };
          });
        }),
        catchError(errors => {
          this.messageHandler.showError('There was a problem getting the configuration properties.', errors);
          return [];
        })
      )
      .subscribe((data: ApiPropertyEditableState[]) => {
        this.emailTemplateApiProperties = data.filter(p => p.metadata.group === ApiPropertyGroup.EmailTemplates);
      });
  }

  apiPropertyCleared() {
    this.getApiProperties();
  }

  tabSelected(itemsName) {
    const tab = this.getTabDetail(itemsName);
    this.stateHandler.Go('configuration', { tabView: tab.name }, { notify: false, location: tab.index !== 0 });
  }

  getTabDetail(tabIndex) {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'email' };
      case 1:
        return { index: 1, name: 'lucene' };
      default:
        return { index: 0, name: 'email' };
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'email':
        return { index: 0, name: 'email' };
      case 'lucene':
        return { index: 1, name: 'lucene' };
      default:
        return { index: 0, name: 'email' };
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
