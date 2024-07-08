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
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/angular';
import { Observable, throwError } from 'rxjs';

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
  targetFolderId: Uuid;
  setupForm: FormGroup;
  messageHandler: any;
  folders: any;

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
    const sourceId: Uuid = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;
  this.getCatalogueItemDetails(this.domainType, sourceId).subscribe((response) => {
      this.source = response.body;
      this.targetName = this.source.label + ' (copy)';
      this.loaded = true;
    });
    this.loadFolders();

    this.setupForm = new FormGroup({
      action: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      asynchronous: new FormControl(false)
    });

  }

  onCommitChanges(): void {
    // save stuff
  }

  onCancelChanges(): void {
    this.stateHandler.GoPrevious();
  }


  cancelCopy() {

  }

  commitCopy() {

  }



//   Data Models
// Data Classes
// Data Elements
// Terminologies
// Terms
// Code Sets

  getCatalogueItemDetails(
    domainType: CatalogueItemDomainType,
    id: Uuid): Observable<MdmResponse<CatalogueItemDetail>> {
    switch (domainType) {
      case CatalogueItemDomainType.DataModel:
        return this.resources.dataModel.get(id);
      case CatalogueItemDomainType.Terminology:
        return this.resources.terminology.get(id);
      case CatalogueItemDomainType.CodeSet:
        return this.resources.codeSet.get(id);
      case CatalogueItemDomainType.Term:
          return this.getTermByTermId(id);
      case CatalogueItemDomainType.DataElement:
          return this.getDataElementByDataElementId(id);
      case CatalogueItemDomainType.DataClass:
          return this.getDataClassByDataClassId(id);
      default:
        return throwError(`Cannot get catalogue item details for ${domainType} ${id}: unrecognised domain type.`);
    }
  }

  getTermByTermId(id: Uuid): Observable<MdmResponse<CatalogueItemDetail>> {
    return this.resources.terminology.get(id).subscribe(
      (response) => {
        const terminologyId = response.body.terminologyId;
        return this.resources.term.get(terminologyId, id);
      }
    );
  }

  getDataClassByDataClassId(id: Uuid): Observable<MdmResponse<CatalogueItemDetail>> {
  // get dataModel then get dataClass
    return this.resources.dataModel.get(id).subscribe(
      (response) => {
        const dataModelId = response.body.dataModelId;
        return this.resources.dataClass.get(dataModelId, id);
      }
    );
  }


  getDataElementByDataElementId(id: Uuid): Observable<MdmResponse<CatalogueItemDetail>> {
      // get dataModel then get dataClass then get dataElement
      return null;
  }

  loadFolders = () => {
    this.loaded = false;
    const options = {
      queryStringParams: {
        includeDocumentSuperseded: true,
        includeModelSuperseded: true,
        includeDeleted: true,
      },
    };
    let url = this.resources.tree.list(ContainerDomainType.Folders, options.queryStringParams);

      url = this.resources.tree.list(ContainerDomainType.Folders, options.queryStringParams);

    url.subscribe((resp) => {
      this.folders = {
        children: resp.body,
        isRoot: true,
      };
      this.loaded = true;
    }, (err) => {
      this.loaded = true;
      this.messageHandler.showError('There was a problem loading tree.', err);
    });
  };

}
