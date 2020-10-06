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
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FolderResult } from '@mdm/model/folderModel';
import { DataModelResult } from '@mdm/model/dataModelModel';
import { forEach } from '@uirouter/core';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-element-classifications',
  templateUrl: './element-classifications.component.html',
  styleUrls: ['./element-classifications.component.sass']
})
export class ElementClassificationsComponent implements OnInit {

  @Input() editableForm: any;
  @Input() readOnly = true;

  classificationsVal: any[];
  @Output() classificationsChanged = new EventEmitter<any[]>();
  @Input() get classifications() {
    return this.classificationsVal;
  }
  set classifications(val) {

    this.classificationsVal = val;
    this.classificationsChanged.emit(this.classificationsVal);
  }

  @Input() inEditMode: boolean;
  @Input() property: string;
  @Input() element: DataModelResult;
  @Input() newWindow = false;
  target: string;
  lastWasShiftKey: any;
  formData: any = {
    showMarkDownPreview: Boolean,
    classifiers: []
  };
  allClassifications: any;
  selectedClassification = [];
  constructor(private elementTypes: ElementTypesService, private resourceService: MdmResourcesService) { }

  ngOnInit() {
    this.getAllClassifications();
    if (!this.editableForm.visible) {
      if (this.newWindow) {
        this.target = '_blank';
      }
      if (this.classifications !== undefined) {
        this.formData.classifiers = this.classifications;
        this.formData.classifiers.forEach((classification) => {
          classification.domainType = 'Classifier';
          classification.link = this.elementTypes.getLinkUrl(classification);
        });
      }
    } else {
      this.formData.classifiers = this.editableForm.classifiers;
    }

  }
  getAllClassifications() {
    this.resourceService.classifier.list().subscribe(result => {
      this.allClassifications = result.body.items;
      const selectedList: any[] = [];
      if (this.classifications !== undefined) {
        this.classifications.forEach((classification) => {
          const selected = this.allClassifications.find(c => c.id === classification.id);
          selectedList.push(selected);
        });
        this.selectedClassification = selectedList;
        this.formData.classifiers = selectedList;
        this.editableForm.classifiers = selectedList;
      }
    });
  }
  onModelChanged() {
    this.formData.classifiers = this.selectedClassification;
    this.editableForm.classifiers = this.selectedClassification;
    this.classifications = this.selectedClassification;
  }
}
