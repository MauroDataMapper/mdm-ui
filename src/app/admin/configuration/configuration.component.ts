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
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ConfigurationPropertiesResult } from '@mdm/model/ConfigurationProperties';
import { from } from 'rxjs';
import { ObjectEnhancerService } from '@mdm/services/utility/object-enhancer.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.sass']
})
export class ConfigurationComponent implements OnInit {
  propertiesTemp: any;
  properties: ConfigurationPropertiesResult;
  oldConfiguration: ConfigurationPropertiesResult;
  activeTab: any;
  resource: any;
  indexingStatus: string;
  indexingTime: string;

  constructor(
    private resourcesService: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private objectEnhancer: ObjectEnhancerService,
    private title: Title
  ) {}

  ngOnInit() {
    this.getConfig();
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView);
    this.indexingStatus = '';
    this.title.setTitle('Configuration');
  }

  getConfig() {
    this.resourcesService.admin.properties()
    // this.resourcesService.admin.get('properties', null)
    .subscribe((result: { body: any }) => {
        this.properties = result.body;
        // this.propertiesTemp = this.propertyRenamingService.renameKeys(result.body);
        // this.properties = this.propertiesTemp;

        this.oldConfiguration = Object.assign({}, this.properties);
      },
      err => {
        this.messageHandler.showError('There was a problem getting the configuration properties.', err);
      });
  }

  // Create or edit a configuration property
  submitConfig() {
    this.resource = this.objectEnhancer.diff(this.properties, this.oldConfiguration);

    from(this.resourcesService.admin.editProperties(this.resource)).subscribe(() => {
    // from(this.resourcesService.admin.post('editProperties', {resource: this.resource})).subscribe(() => {
        this.messageHandler.showSuccess('Configuration properties updated successfully.');
        // refresh the page
        this.getConfig();
      },
      error => {
        this.messageHandler.showError('There was a problem updating the configuration properties.', error);
      }
    );
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

    this.resourcesService.admin.rebuildLuceneIndexes(null)
    // this.resourcesService.admin.post('rebuildLuceneIndexes', null)
    .subscribe(() => {
        this.indexingStatus = 'success';
      },
      error => {
        if (error.status === 418) {
          this.indexingStatus = 'success';
          if (error.error && error.error.timeTaken) {
            this.indexingTime = 'in ' + error.error.timeTaken;
          }
        } else {
          this.indexingStatus = 'error';
        }
      }
    );
  }
}
