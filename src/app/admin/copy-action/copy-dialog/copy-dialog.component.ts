/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Title } from '@angular/platform-browser';
import {
  Uuid,
  CatalogueItemDomainType,
  MdmResponse,
  CatalogueItemDetail,
  ContainerDomainType,
  CopyTermPayload,
  CopyDataClassPayload,
  CopyDataElementPayload,
  CopyContainerPayload
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/angular';
import { Observable } from 'rxjs';

/**
 * Top-level view component for the Merge/Diff user interface.
 *
 * Controls the top-level data to fetch/render, controls for the overall merge operations and
 * child components for rendering the different sections of data.
 */
@Component({
  selector: 'mdm-copy-dialog',
  templateUrl: './copy-dialog.component.html',
  styleUrls: ['./copy-dialog.component.scss']
})
export class CopyDialogComponent implements OnInit {
  loaded = false;
  loadingContent = false;
  source: CatalogueItemDetail;
  domainType: CatalogueItemDomainType;
  activeTab: number;
  targetName: string;
  targetDestinationId: Uuid;
  subTargetDestinationId: Uuid;
  setupForm: FormGroup;
  messageHandler: any;
  folders: any;
  dataModels: any;
  dataClasses: any;
  terminologies: any;
  copyPermissions: false;
  parentId: Uuid;
  parentParentId: Uuid;

  constructor(
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private title: Title,
    private resources: MdmResourcesService
  ) {}

  get label() {
    return this.setupForm.get('label');
  }

  ngOnInit(): void {
    this.title.setTitle('Copy Item');

    //Think we need to either modify the routing to pass the parent id or parent parent id or we need to get the parent id from the source object
    //I think this is somethign that exists but ask pete how it might work?
    const sourceId: Uuid = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;
    this.parentId =
      this.uiRouterGlobals.params.parentId ?? null;
    this.parentParentId = this.uiRouterGlobals.params.parentParentId ?? null;
    this.getCatalogueItemDetails(this.domainType, sourceId).subscribe(
      (response) => {
        this.source = response.body;
        this.targetName = this.source.label + ' (copy)';
        this.loaded = true;
      }
    );
    this.loadNodes();

    this.setupForm = new FormGroup({
      action: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      asynchronous: new FormControl(false)
    });
  }

  cancelCopy() {
    this.stateHandler.GoPrevious();
  }

  commitCopy() {
    if (!this.targetDestinationId) {
      this.messageHandler.showError(`Please select a target folder to copy the ${this.domainType} to.`);
      return;
    }



    const payload:
      | CopyContainerPayload
      | CopyTermPayload
      | CopyDataClassPayload
      | CopyDataElementPayload = this.generatePayloadByDomain(this.domainType);

    if (!payload) {
      this.messageHandler.showError(
        `no payload generated for ${this.domainType} ${this.source.label}: unrecognised domain type.`
      );
      return;
    }

    switch (this.domainType) {
      case CatalogueItemDomainType.DataModel: {
        return this.resources.dataModel.copy(
          this.source.id,
          payload as CopyContainerPayload
        );
      }
      case CatalogueItemDomainType.Terminology: {
        return this.resources.terminology.copy(
          this.source.id,
          payload as CopyContainerPayload
        );
      }
      case CatalogueItemDomainType.CodeSet: {
        return this.resources.codeSet.copy(
          this.source.id,
          payload as CopyContainerPayload
        );
      }
      // modelItems
      case CatalogueItemDomainType.Term: {
        return this.resources.term.copy(
          this.parentId,
          this.source.id,
          payload as CopyTermPayload
        );
      }
      case CatalogueItemDomainType.DataElement: {
        return this.resources.dataElement.copy(
          this.source.id,
          payload as CopyDataElementPayload
        );
      }
      case CatalogueItemDomainType.DataClass: {
        return this.resources.dataClass.copy(
          this.source.id,
          payload as CopyDataClassPayload
        );
      }
      default:
        this.messageHandler.showError(
          `Cannot get catalogue item details for ${this.domainType} ${this.source.label}: unrecognised domain type.`
        );
    }
  }

  generatePayloadByDomain(
    domainType: CatalogueItemDomainType
  ):
    | CopyContainerPayload
    | CopyTermPayload
    | CopyDataClassPayload
    | CopyDataElementPayload {
    switch (domainType) {
      case CatalogueItemDomainType.DataModel: {
        return {
          folderId: this.targetDestinationId,
          label: this.targetName,
          copyPermissions: this.copyPermissions
        };
      }
      case CatalogueItemDomainType.Terminology: {
        return {
          folderId: this.targetDestinationId,
          label: this.targetName,
          copyPermissions: this.copyPermissions
        };
      }
      case CatalogueItemDomainType.CodeSet: {
        return {
          folderId: this.targetDestinationId,
          label: this.targetName,
          copyPermissions: this.copyPermissions
        };
      }
      // modelItems
      case CatalogueItemDomainType.Term: {
        return {
          targetTerminologyId: this.targetDestinationId,
          code: this.targetName
        };
      }
      case CatalogueItemDomainType.DataElement: {
        return {
          targetDataModelId: this.targetDestinationId,
          targetDataClassId: this.subTargetDestinationId,
          sourceDataModelId: this.source.model.id,
          sourceDataClassId: this.source.dataClass.id
        };
      }
      case CatalogueItemDomainType.DataClass: {
        return {
          targetDataModelId: this.targetDestinationId,
          sourceDataModelId: this.source.model.id
        };
      }
      default:
        this.messageHandler.showError(
          `Cannot generate payload for ${this.domainType}: unrecognised domain type.`
        );
    }
  }

  getCatalogueItemDetails(
    domainType: CatalogueItemDomainType,
    id: Uuid
  ): Observable<MdmResponse<CatalogueItemDetail>> {
    switch (domainType) {
      case CatalogueItemDomainType.DataModel:
        return this.resources.dataModel.get(id);
      case CatalogueItemDomainType.Terminology:
        return this.resources.terminology.get(id);
      case CatalogueItemDomainType.CodeSet:
        return this.resources.codeSet.get(id);
      // modelItems
      case CatalogueItemDomainType.Term:
        return this.resources.term.get(this.parentId, id);
      case CatalogueItemDomainType.DataClass:
        return this.resources.dataClass.get(this.parentId, id);
      case CatalogueItemDomainType.DataElement:
        return this.resources.dataElement.get(this.parentParentId, this.parentId, id);

      default:
        this.messageHandler.showError(
          `Cannot get catalogue item details for ${domainType} ${id}: unrecognised domain type.`
        );
    }
  }

  loadNodes  = () =>{
    switch (this.domainType) {
      case CatalogueItemDomainType.DataModel:
        return this.loadFolders();
      case CatalogueItemDomainType.Terminology:
        return this.loadFolders();
      case CatalogueItemDomainType.CodeSet:
        return this.loadFolders();
      // case CatalogueItemDomainType.Term:
      //   return this.loadTerminologies();
      // case CatalogueItemDomainType.DataElement:
      //   return this.loadDataModels();
      // case CatalogueItemDomainType.DataClass:
      //   return this.loadDataClasses();
       default:
        return this.loadFolders();
    }
  };

  loadFolders = () => {
    this.loaded = false;
    const options = {
      queryStringParams: {
        includeDocumentSuperseded: false,
        includeModelSuperseded: false,
        includeDeleted: false
      }
    };
    const url = this.resources.tree.list(
      ContainerDomainType.Folders,
      options.queryStringParams
    );
    url.subscribe(
      (resp) => {
        this.folders = {
          children: resp.body,
          isRoot: true
        };
        this.loaded = true;
      },
      (err) => {
        this.loaded = true;
        this.messageHandler.showError('There was a problem loading tree.', err);
      }
    );
  };

  onNodeInTreeSelect(node) {
    this.targetDestinationId = node.id;
  }


}
