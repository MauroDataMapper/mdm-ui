/*
Copyright 2021 University of Oxford

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
import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FederatedDataModel, FederatedDataModelForm } from '@mdm/model/federated-data-model';
import { EditingService } from '@mdm/services/editing.service';
import { Editable } from '@mdm/model/editable-forms';

@Component({
  selector: 'mdm-federated-data-model-detail',
  templateUrl: './federated-data-model-detail.component.html',
  styleUrls: ['./federated-data-model-detail.component.scss']
})
export class FederatedDataModelDetailComponent implements OnInit {

  @Input() dataModel: FederatedDataModel;

  editable: Editable<FederatedDataModel, FederatedDataModelForm>;

  constructor(
    private editingService: EditingService,
    private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle(`Federated Data Model - ${this.dataModel.label}`);

    this.editable = new Editable(
      this.dataModel, 
      new FederatedDataModelForm());

    this.editable.onCancel.subscribe(() => {
      this.editingService.stop();      
    });
  }

  formBeforeSave() {

  }
}
