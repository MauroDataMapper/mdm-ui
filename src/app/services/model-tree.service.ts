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
import { Injectable, OnDestroy } from '@angular/core';
import { ClassifierDetailResponse, FolderDetailResponse, SubscribedCatalogue, SubscribedCatalogueIndexResponse, Uuid, VersionedFolderDetailResponse } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { Node, DOMAIN_TYPE } from '@mdm/folders-tree/flat-node';
import { NewFolderModalComponent } from '@mdm/modals/new-folder-modal/new-folder-modal.component';
import { NewFolderModalConfiguration, NewFolderModalResponse } from '@mdm/modals/new-folder-modal/new-folder-modal.model';
import { MdmResourcesService, MdmRestHandlerOptions } from '@mdm/modules/resources';
import { SubscribedCataloguesService } from '@mdm/subscribed-catalogues/subscribed-catalogues.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { BroadcastService } from './broadcast.service';
import { EditingService } from './editing.service';
import { SharedService } from './shared.service';
import { MessageHandlerService } from './utility/message-handler.service';
import { UserSettingsHandlerService } from './utility/user-settings-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ModelTreeService implements OnDestroy {

  currentNode?: Node;

  private unsubscribe$ = new Subject();

  constructor(
    private resources: MdmResourcesService,
    private sharedService: SharedService,
    private userSettingsHandler: UserSettingsHandlerService,
    private subscribedCatalogues: SubscribedCataloguesService,
    private messageHandler: MessageHandlerService,
    private broadcast: BroadcastService,
    private editing: EditingService) {

    this.broadcast
      .onCatalogueTreeNodeSelected()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => this.currentNode = data.node);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getLocalCatalogueTreeNodes(noCache?: boolean): Observable<Node[]> {
    let options: any = {};
    if (this.sharedService.isLoggedIn()) {
      options = {
        queryStringParams: {
          includeDocumentSuperseded: this.userSettingsHandler.get('includeDocumentSuperseded') || false,
          // includeModelSuperseded: this.userSettingsHandler.get('includeModelSuperseded') || false,
          includeModelSuperseded: true,
          includeDeleted: this.userSettingsHandler.get('includeDeleted') || false
        }
      };
    }
    if (noCache) {
      options.queryStringParams.noCache = true;
    }

    return this.resources.tree
      .list('folders', options.queryStringParams)
      .pipe(
        map((response: any) => response.body as Node[])
      );
  }

  getSubscribedCatalogueTreeNodes(): Observable<Node[]> {
    if (!this.sharedService.isLoggedIn(true) || !this.sharedService.features.useSubscribedCatalogues) {
      return of([]);
    }

    const queryParams = {
      sort: 'label',
      order: 'asc'
    };

    // Handle any HTTP errors manually. This covers the scenario where this is unable to
    // get available subscribed catalogues e.g. the subscribed catalogue instance is not
    // available/offline
    const restOptions: MdmRestHandlerOptions = {
      handleGetErrors: false
    };

    return this.resources.subscribedCatalogues
      .list(queryParams, restOptions)
      .pipe(
        map((response: SubscribedCatalogueIndexResponse) => response.body.items ?? []),
        map((catalogues: SubscribedCatalogue[]) => catalogues.map(item => Object.assign<{}, Node>({}, {
          id: item.id,
          domainType: DOMAIN_TYPE.SubscribedCatalogue,
          hasChildren: true,
          label: item.label
        }))),
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the Subscribed Catalogues.', error);
          return of<Node[]>([]);
        }),
      );
  }

  createRootNode(children?: Node[]): Node {
    return Object.assign<{}, Node>({}, {
      id: '',
      domainType: DOMAIN_TYPE.Root,
      children,
      hasChildren: true,
      isRoot: true
    });
  }

  createLocalCatalogueNode(children?: Node[]): Node {
    return Object.assign<{}, Node>({}, {
      id: '4aa2444c-ed08-471b-84dd-96f6b3b4a00a',
      domainType: DOMAIN_TYPE.LocalCatalogue,
      label: 'This catalogue',
      hasChildren: true,
      children
    });
  }

  createExternalCataloguesNode(children?: Node[]): Node {
    return Object.assign<{}, Node>({}, {
      id: '30dca3f9-5cf5-41a8-97eb-fd2dab2d4c20',
      domainType: DOMAIN_TYPE.ExternalCatalogues,
      label: 'External catalogues',
      hasChildren: true,
      children
    });
  }

  /**
   * Gets all external, federated data models available and returns them as `Node` objects for the model tree.
   *
   * @param catalogueId The UUID of the subscribed catalogue to search under.
   *
   * Each returned `Node` object will contain a `FederatedDataModel` inside the `Node.dataModel` property. It is
   * required that the model tree pass this on to the detail component views during UI state transitions because
   * there is no endpoint available for getting a single `FederatedDataModel` - this assignment will reduce
   * roundtrips back to the server.
   *
   * @see FederatedDataModel
   */
  getFederatedDataModelNodes(catalogueId: string): Observable<Node[]> {
    return this.subscribedCatalogues
      .getFederatedDataModels(catalogueId)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting federated data models from a subscribed catalogue.', error);
          return [];
        }),
        map(models => models.map(item => Object.assign<{}, Node>({}, {
          id: item.modelId,
          domainType: DOMAIN_TYPE.FederatedDataModel,
          hasChildren: false,
          label: item.label,
          parentId: item.catalogueId
        })))
      );
  }

  /**
   * Display a dialog to create a new folder, then save the new folder to the model tree.
   *
   * @param parentFolderId The unique identifier of the parent folder to add the new folder to.
   * If no parent is required, ignore this parameter or pass `null` or `undefined`.
   * @returns An `Observable` containing either a `FolderDetailResponse` or `VersionedFolderDetailResponse`,
   * depending on the options selected in the dialog.
   */
  createNewFolder(settings: { allowVersioning?: boolean, parentFolderId?: Uuid }): Observable<FolderDetailResponse | VersionedFolderDetailResponse> {
    return this.editing
      .openDialog<NewFolderModalComponent, NewFolderModalConfiguration, NewFolderModalResponse>(
        NewFolderModalComponent,
        {
          data: {
            modalTitle: 'Create a new Folder',
            okBtn: 'Add folder',
            btnType: 'primary',
            inputLabel: 'Folder name',
            message: 'Please enter the name of your Folder.',
            createRootFolder: !(settings?.parentFolderId),
            canVersion: settings?.allowVersioning
          }
        })
      .afterClosed()
      .pipe(
        filter(response => response?.status === ModalDialogStatus.Ok),
        switchMap(modal => {
          if (modal.useVersionedFolders && modal.isVersioned) {
            return this.saveVersionedFolder(modal.label, settings?.parentFolderId);
          }

          return this.saveFolder(modal.label, settings?.parentFolderId);
        })
      );
  }

  /**
   * Display a dialog to create a new classifier, then save the new classifier to the model tree.
   *
   * @returns An `Observable` containing a `ClassifierDetailResponse`.
   */
  createNewClassifier(): Observable<ClassifierDetailResponse> {
    return this.editing
      .openDialog<NewFolderModalComponent, NewFolderModalConfiguration, NewFolderModalResponse>(
        NewFolderModalComponent,
        {
          data: {
            modalTitle: 'Create a new Classifier',
            okBtn: 'Add Classifier',
            btnType: 'primary',
            inputLabel: 'Classifier name',
            message: 'Please enter the name of your Classifier.'
          }
        })
      .afterClosed()
      .pipe(
        filter(response => response?.status === ModalDialogStatus.Ok),
        switchMap(modal => this.saveClassifier(modal.label))
      );
  }

  saveFolder(label: string, parentFolderId?: Uuid): Observable<FolderDetailResponse> {
    if (parentFolderId) {
      return this.resources.folder.saveChildrenOf(parentFolderId, { label });
    }

    return this.resources.folder.save({ label });
  }

  saveVersionedFolder(label: string, parentFolderId?: Uuid): Observable<VersionedFolderDetailResponse> {
    if (parentFolderId) {
      return this.resources.versionedFolder.saveToFolder(parentFolderId, { label });
    }

    return this.resources.versionedFolder.save({ label });
  }

  saveClassifier(label: string): Observable<ClassifierDetailResponse> {
    return this.resources.classifier.save({ label });
  }
}