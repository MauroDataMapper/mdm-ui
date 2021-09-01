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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Title } from '@angular/platform-browser';
import { ApiProperty, ApiPropertyIndexResponse, ApiPropertyResponse } from '@maurodatamapper/mdm-resources';
import { ApiPropertyEditableState, ApiPropertyEditType, ApiPropertyMetadata, propertyMetadata } from '@mdm/model/api-properties';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService, MessageHandlerService, StateHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { UIRouterGlobals } from '@uirouter/core';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'mdm-api-property',
  templateUrl: './api-property.component.html',
  styleUrls: ['./api-property.component.scss']
})
export class ApiPropertyComponent implements OnInit {

  id: string;
  isNew: boolean;
  editExisting = false;
  property: ApiPropertyEditableState;
  systemProperties: ApiPropertyMetadata[];
  selectedSystemProperty: ApiPropertyMetadata;

  formGroup: FormGroup;

  get key() {
    return this.formGroup.get('key');
  }

  get category() {
    return this.formGroup.get('category');
  }

  get publiclyVisible() {
    return this.formGroup.get('publiclyVisible');
  }

  get value() {
    return this.formGroup.get('value');
  }

  EditTypes = ApiPropertyEditType;

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private broadcast: BroadcastService,
    private editing: EditingService,
    private title: Title) { }

  ngOnInit(): void {
    this.editing.start();

    this.id = this.uiRouterGlobals.params.id;
    this.editExisting = this.id !== undefined && this.id !== null;

    if (this.editExisting) {
      this.title.setTitle('Configuration - Edit Property');
      this.loadExistingProperty();
    }
    else {
      this.title.setTitle('Configuration - Add Property');
      this.loadAvailableSystemProperties();
    }
  }

  systemPropertyChanged(change: MatSelectChange) {
    if (change.value) {
      this.property.metadata = propertyMetadata.find(m => m.key === change.value);
    }
    else {
      this.property.metadata = this.getBlankMetadata();
    }

    this.key.setValue(this.property.metadata.key);
    this.category.setValue(this.property.metadata.category);
    this.publiclyVisible.setValue(this.property.metadata.isSystem);

    if (this.property.metadata.isSystem) {
      this.publiclyVisible.disable();
    }
    else {
      this.publiclyVisible.enable();
    }
  }

  htmlValueChanged(value: string) {
    this.value.setValue(value);
  }

  cancel() {
    this.editing.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.navigateToParent();
      }
    });
  }

  save() {
    if (this.formGroup.invalid) {
      return;
    }

    if (this.editExisting) {
      const updated = Object.assign({}, this.property.original);
      updated.key = this.key?.value;
      updated.category = this.category?.value;
      updated.publiclyVisible = this.publiclyVisible?.value;
      updated.value = this.value?.value;

      this.resources.apiProperties
        .update(this.property.original.id, updated)
        .pipe(
          catchError(errors => {
            this.messageHandler.showError('There was a problem updating the property.', errors);
            return [];
          })
        )
        .subscribe(() => {
          this.messageHandler.showSuccess('Property was updated successfully.');
          this.broadcast.apiPropertyUpdated({
            key: this.key.value,
            value: this.value.value });
          this.navigateToParent();
        });
    }
    else {
      const data: ApiProperty = {
        key: this.key?.value,
        value: this.value?.value,
        publiclyVisible: this.publiclyVisible?.value ?? false,
        category: this.category?.value
      };

      this.resources.apiProperties
        .save(data)
        .pipe(
          catchError(errors => {
            this.messageHandler.showError('There was a problem saving the property.', errors);
            return [];
          })
        )
        .subscribe(() => {
          this.messageHandler.showSuccess('Property was saved successfully.');
          this.broadcast.apiPropertyUpdated({
            key: this.key.value,
            value: this.value.value });
          this.navigateToParent();
        });
    }
  }

  private createFormGroup() {
    this.formGroup = new FormGroup({
      key: new FormControl(this.property.metadata.key, [Validators.required]),  // eslint-disable-line @typescript-eslint/unbound-method
      category: new FormControl(this.property.metadata.category, [Validators.required]),  // eslint-disable-line @typescript-eslint/unbound-method
      publiclyVisible: new FormControl({ value: this.property.metadata.publiclyVisible, disabled: this.property.metadata.isSystem }),
      value: new FormControl(this.property.original?.value, [Validators.required])  // eslint-disable-line @typescript-eslint/unbound-method
    });
  }

  private getBlankMetadata() {
    return {
      key: '',
      category: '',
      publiclyVisible: false,
      editType: ApiPropertyEditType.Value,
      isSystem: false
    };
  }

  private loadExistingProperty() {
    this.resources.apiProperties
      .get(this.id)
      .pipe(
        map((response: ApiPropertyResponse): ApiPropertyEditableState => {
          const original = response.body;
          const metadata = propertyMetadata.find(p => p.key === original.key) ?? {
            key: original.key,
            category: original.category,
            isSystem: false,
            publiclyVisible: original.publiclyVisible,
            editType: ApiPropertyEditType.Value
          };

          return {
            metadata,
            original
          };
        }),
        catchError(errors => {
          this.messageHandler.showError('There was a problem getting the property.', errors);
          return [];
        })
      )
      .subscribe((data: ApiPropertyEditableState) => {
        this.property = data;
        this.createFormGroup();
      });
  }

  private loadAvailableSystemProperties() {
    this.resources.apiProperties
      .list()
      .pipe(
        map((response: ApiPropertyIndexResponse) => {
          return response.body.items;
        }),
        catchError(errors => {
          this.messageHandler.showError('There was a problem getting the properties.', errors);
          return [];
        })
      )
      .subscribe((data: ApiProperty[]) => {
        this.systemProperties = propertyMetadata.filter(m => data.every(p => p.key !== m.key));
        this.property = {
          metadata: this.getBlankMetadata()
        };
        this.createFormGroup();
      });
  }

  private navigateToParent() {
    this.editing.stop();
    this.stateHandler.Go(
      'appContainer.adminArea.configuration',
      {
        tabView: 'properties'
      },
      {
        reload: this.property.metadata.requiresReload,
        inherit: false
      });
  }
}
