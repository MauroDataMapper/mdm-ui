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
  CopyModelPayload
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { StateParams, UIRouterGlobals } from '@uirouter/angular';
import { catchError, EMPTY, finalize, Observable } from 'rxjs';

/**
 * Top-level view component for the Merge/Diff user interface.
 *
 * Controls the top-level data to fetch/render, controls for the overall merge operations and
 * child components for rendering the different sections of data.
 */
@Component({
  selector: 'mdm-copy-dialog',
  templateUrl: './copy-action.component.html',
  styleUrls: ['./copy-action.component.scss']
})
export class CopyActionComponent implements OnInit {
  loaded = false;
  loadingContent = false;
  targetClick = false;
  source: CatalogueItemDetail;
  domainType: CatalogueItemDomainType;
  activeTab: number;
  targetName: string;
  targetDestinationId: Uuid;
  subTargetDestinationId: Uuid;
  setupForm: FormGroup;
  tree: any;
  copyPermissions = false;
  parentId: Uuid;
  parentParentId: Uuid;
  destinationSelector:
    | 'folders'
    | 'terminologies'
    | 'dataclasses'
    | 'datamodels' = 'folders';
  copying = false;

  constructor(
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals,
    private title: Title,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) {}

  get label() {
    return this.setupForm.get('label');
  }

  ngOnInit(): void {
    this.title.setTitle('Copy Item');
    const sourceId: Uuid = this.uiRouterGlobals.params.id;
    this.extractParams(this.uiRouterGlobals.params);
    this.getCatalogueItemDetails(this.domainType, sourceId).subscribe(
      (response) => {
        this.source = response.body;
        this.targetName = this.source.label + ' (copy)';
        this.loaded = true;
      }
    );
    this.loadNodes();

    this.setupForm = new FormGroup({
      label: new FormControl('', Validators.required) // eslint-disable-line @typescript-eslint/unbound-method
    });
  }

  extractParams(params: StateParams) {
    if (!params.domainType) {
      this.stateHandler.GoPrevious();
      this.messageHandler.showError(
        `Cannot get catalogue item details for ${this.source.label}: unrecognised domain type.`
      );
    }

    this.domainType = params.domainType;

    switch (this.domainType) {
      case CatalogueItemDomainType.Term:
        this.destinationSelector = 'terminologies';
        break;
      case CatalogueItemDomainType.DataElement:
        this.destinationSelector = 'dataclasses';
        break;
      case CatalogueItemDomainType.DataClass:
        this.destinationSelector = 'datamodels';
        break;
      default:
        this.destinationSelector = 'folders';
        break;
    }

    switch (this.domainType) {
      case CatalogueItemDomainType.Term:
        if (params.terminologyId) {
          this.parentId = params.terminologyId;
        } else {
          // params are wrapped differently by a refresh of the page. this handles that case
          this.parentId = params.dataModelId;
        }
        break;
      case CatalogueItemDomainType.DataElement:
        this.parentId = params.dataClassId;
        this.parentParentId = params.dataModelId;
        break;
      case CatalogueItemDomainType.DataClass:
        this.parentId = params.dataModelId;
        break;
      default:
        break;
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
      // modelItems have different get endpoint requirements
      case CatalogueItemDomainType.Term:
        return this.resources.term.get(this.parentId, id);
      case CatalogueItemDomainType.DataClass:
        return this.resources.dataClass.get(this.parentId, id);
      case CatalogueItemDomainType.DataElement:
        return this.resources.dataElement.get(
          this.parentParentId,
          this.parentId,
          id
        );

      default:
        this.messageHandler.showError(
          `Cannot get catalogue item details for ${domainType} ${id}: unrecognised domain type.`
        );
    }
  }

  commitCopy() {
    this.targetName = this.setupForm.get('label').value;
    if (!this.targetDestinationId) {
      this.messageHandler.showError(
        `Please select a target folder to copy the ${this.domainType} to.`
      );
      return;
    }

    if (
      this.domainType === CatalogueItemDomainType.DataElement &&
      !this.subTargetDestinationId
    ) {
      this.messageHandler.showError(
        `Please select a target data class to copy the ${this.domainType} to.`
      );
      return;
    }

    const payload:
      | CopyModelPayload
      | CopyTermPayload
      | CopyDataClassPayload
      | CopyDataElementPayload = this.generatePayloadByDomain(this.domainType);

    this.copying = true;

    this.sendCopyRequest(payload)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            `Failed to copy ${this.domainType} ${this.source.label} to ${this.targetName}.`,
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.copying = false))
      )
      .subscribe((response) => {
        this.messageHandler.showSuccess(
          `Successfully copied ${this.domainType} ${this.source.label} to ${this.targetName} as ${this.targetName}.`
        );
        switch (this.domainType) {
          case CatalogueItemDomainType.DataModel:
            this.stateHandler.Go(
              'datamodel',
              { id: response.body.id },
              { reload: true, location: true }
            );
            break;
          case CatalogueItemDomainType.Terminology:
            this.stateHandler.Go(
              'terminology',
              { id: response.body.id },
              { reload: true, location: true }
            );
            break;
          case CatalogueItemDomainType.CodeSet:
            this.stateHandler.Go(
              'codeset',
              { id: response.body.id },
              { reload: true, location: true }
            );
            break;
          case CatalogueItemDomainType.Term:
            this.stateHandler.Go(
              'term',
              { id: response.body.id, terminologyId: response.body.model },
              { reload: true, location: true }
            );
            break;
          case CatalogueItemDomainType.DataElement:
            this.stateHandler.Go(
              'dataelement',
              {
                id: response.body.id,
                dataModelId: response.body.model,
                dataClassId: response.body.dataClass
              },
              { reload: true, location: true }
            );
            break;
          case CatalogueItemDomainType.DataClass:
            this.stateHandler.Go(
              'dataclass',
              {
                id: response.body.id,
                dataModelId: response.body.model,
                dataClassId: response.body.parentDataClass ?? ''
              },
              { reload: true, location: true }
            );
            break;
          default:
            this.stateHandler.GoPrevious();
            break;
        }
      });
  }

  cancelCopy() {
    this.stateHandler.GoPrevious();
  }

  generatePayloadByDomain(
    domainType: CatalogueItemDomainType
  ):
    | CopyModelPayload
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
          copyLabel: this.targetName,
          copyPermissions: this.copyPermissions
        };
      }
      case CatalogueItemDomainType.DataClass: {
        return {
          copyLabel: this.targetName,
          copyPermissions: this.copyPermissions
        };
      }
      default:
        this.messageHandler.showError(
          `Cannot generate payload for ${this.domainType}: unrecognised domain type.`
        );
    }
  }

  sendCopyRequest(payload): Observable<any> {
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
          payload as CopyModelPayload
        );
      }
      case CatalogueItemDomainType.Terminology: {
        return this.resources.terminology.copy(
          this.source.id,
          payload as CopyModelPayload
        );
      }
      case CatalogueItemDomainType.CodeSet: {
        return this.resources.codeSet.copy(
          this.source.id,
          payload as CopyModelPayload
        );
      }
      // modelItems
      case CatalogueItemDomainType.Term: {
        return this.resources.terms.copy(
          this.parentId,
          this.source.id,
          payload as CopyTermPayload
        );
      }
      case CatalogueItemDomainType.DataElement: {
        return this.resources.dataElement.copy(
          this.subTargetDestinationId,
          this.targetDestinationId,
          this.source.model,
          this.source.dataClass,
          this.source.id,
          payload as CopyDataElementPayload
        );
      }
      case CatalogueItemDomainType.DataClass: {
        return this.resources.dataClass.copy(
          this.targetDestinationId,
          this.source.model,
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

  loadNodes = () => {
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
        this.tree = {
          children: resp.body,
          isRoot: true
        };

        let removedNodes = [];

        this.tree.children.forEach((node) => {
          if (node.finalised ?? false) {
            removedNodes = [...removedNodes, node];
          }

          if (
            [
              CatalogueItemDomainType.DataModel.toString(),
              CatalogueItemDomainType.Terminology.toString(),
              CatalogueItemDomainType.CodeSet.toString()
            ].includes(this.domainType)
          ) {
            // TODO: clean this condition up
          } else {
            // remove node if it has no children in the case of data element and data class
            if (!node.hasChildren ?? false) {
              removedNodes = [...removedNodes, node];
            }

            // it might be possible to futher filter out nodes based if they have a child of the same parent domain type
            // but this would involve getting the tree for each node and slows down the loading so I removed it
          }
        });

        this.tree.children = this.tree.children.filter(
          (node) => !removedNodes.includes(node)
        );

        this.loaded = true;
      },
      (err) => {
        this.loaded = true;
        this.messageHandler.showError('There was a problem loading tree.', err);
      }
    );
  };

  onNodeInTreeSelect(node) {
    this.targetClick = true;
    this.targetDestinationId = node.id;
    this.subTargetDestinationId = node.modelId ? node.modelId : null;
  }
}
