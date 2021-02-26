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
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiProperty, ApiPropertyEditableState, ApiPropertyEditType, ApiPropertyGroup, ApiPropertyResponse, propertyMetadata } from '@mdm/model/api-properties';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
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
  key: string;
  editExisting: boolean = false;
  property: ApiPropertyEditableState;
  propertyValue: string;

  EditTypes = ApiPropertyEditType;

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private editing: EditingService,
    private title: Title) { }

  ngOnInit(): void {
    this.editing.start();

    this.id = this.uiRouterGlobals.params.id;
    this.key = this.uiRouterGlobals.params.key;
    this.editExisting = this.id !== undefined && this.id !== null;   

    if (this.editExisting) {
      this.title.setTitle('Configuration - Edit Property');
      this.loadExistingProperty();
      return;
    }

    this.title.setTitle('Configuration - Add Property');
    this.loadMetadata();
  }

  private loadExistingProperty() {
    this.resources.apiProperties
      .get(this.id)
      .pipe(
        map((response: ApiPropertyResponse): ApiPropertyEditableState => {
          const original = response.body;
          const metadata = propertyMetadata.find(p => p.key === original.key);
          return {
            metadata,
            original
          }
        }),
        catchError(errors => {
          this.messageHandler.showError('There was a problem getting the property.', errors);
          return [];
        })
      )
      .subscribe((data: ApiPropertyEditableState) => {
        this.property = data;
        this.propertyValue = this.property.original.value;
      })
  }

  private loadMetadata() {
    const metadata = propertyMetadata.find(p => p.key === this.key);
    this.property = {
      metadata
    };
    this.propertyValue = '';
  }

  cancel() {
    this.editing.confirmCancelAsync().subscribe(confirm => {
      if (confirm) {
        this.navigateToParent();
      }
    });
  }

  save() {
    if (this.editExisting) {
      let updated = Object.assign({}, this.property.original);
      updated.value = this.propertyValue;

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
          this.navigateToParent();
        });
    }
    else {
      const data: ApiProperty = {
        key: this.property.metadata.key,
        value: this.propertyValue,
        publiclyVisible: this.property.metadata.publiclyVisible ?? false
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
          this.navigateToParent();
        });
    }
  }

  private navigateToParent() {
    this.editing.stop();

    let tabView = '';
    switch (this.property?.metadata?.group) {      
      case ApiPropertyGroup.EmailTemplates:
        tabView = 'email';
        break;
    }

    this.stateHandler.Go('appContainer.adminArea.configuration', { tabView });
  }
}