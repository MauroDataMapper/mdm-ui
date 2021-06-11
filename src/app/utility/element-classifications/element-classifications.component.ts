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
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  Classifier,
  ClassifierIndexResponse,
  DataModelDetail
} from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-element-classifications',
  templateUrl: './element-classifications.component.html',
  styleUrls: ['./element-classifications.component.sass']
})
export class ElementClassificationsComponent implements OnInit {
  @Input() readOnly = true;
  @Input() inEditMode: boolean;
  @Input() property: string;
  @Input() element: DataModelDetail;
  @Input() newWindow = false;

  @Output() classificationsChanged = new EventEmitter<any[]>();
  @Input() classifications: any[];

  target: string;
  lastWasShiftKey: any;
  allClassifications: Classifier[];
  selectedClassification = [];
  constructor(
    private elementTypes: ElementTypesService,
    private resourceService: MdmResourcesService
  ) {}

  ngOnInit() {
    this.getAllClassifications();

    if (this.newWindow) {
      this.target = '_blank';
    }
    if (this.classifications !== undefined) {
      this.classifications.forEach((classification) => {
        classification.domainType = 'Classifier';
        classification.link = this.elementTypes.getLinkUrl(classification);
      });
    }
  }
  getAllClassifications() {
    this.resourceService.classifier
      .list()
      .subscribe((result: ClassifierIndexResponse) => {
        this.allClassifications = result.body.items;
        const selectedList: any[] = [];
        if (this.classifications !== undefined) {
          this.classifications.forEach((classification) => {
            const selected = this.allClassifications.find(
              (c) => c.id === classification.id
            );
            selectedList.push(selected);
          });
          this.selectedClassification = selectedList;
        }
      });
  }
  onModelChanged() {
    this.classificationsChanged.emit(this.selectedClassification);
  }
}
