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
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateService } from '@uirouter/core';

@Component({
  selector: 'mdm-models-merging-graph',
  templateUrl: './models-merging-graph.component.html',
  styleUrls: ['./models-merging-graph.component.scss']
})
export class ModelsMergingGraphComponent implements OnInit {

  isDataLoaded: boolean;

  sourceModel: any;
  targetModel: any;

  constructor(
    private resources: MdmResourcesService,
    private stateService: StateService) { }

  async ngOnInit() {
    const sourceId = this.stateService.params.modelId;

    if (sourceId) {
      this.sourceModel = await this.loadDataModelDetail(sourceId);
    }
  }

  async loadDataModelDetail(modelId) {
    if (!modelId) {
      return null;
    }

    const response = await this.resources.dataModel.get(modelId).toPromise();
    const model = response.body;
    const children = await this.resources.tree.get('dataModels', model.domainType, model.id).toPromise();
    model.children = children.body;
    if (model.children?.length > 0) {
      model.hasChildren = true;
    }

    this.isDataLoaded = true;

    return model;
  }
}
