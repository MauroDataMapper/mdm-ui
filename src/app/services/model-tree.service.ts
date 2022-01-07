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
import { MatDialog } from '@angular/material/dialog';
import { CatalogueItemDomainType, ClassifierDetailResponse, ContainerDomainType, FolderDetailResponse, MdmTreeItem, MdmTreeItemListResponse, Modelable, SubscribedCatalogue, SubscribedCatalogueIndexResponse, Uuid, VersionedFolderDetailResponse } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { FlatNode } from '@mdm/folders-tree/flat-node';
import { NewFolderModalComponent } from '@mdm/modals/new-folder-modal/new-folder-modal.component';
import { NewFolderModalConfiguration, NewFolderModalResponse } from '@mdm/modals/new-folder-modal/new-folder-modal.model';
import { MdmResourcesService, MdmRestHandlerOptions } from '@mdm/modules/resources';
import { SubscribedCataloguesService } from '@mdm/subscribed-catalogues/subscribed-catalogues.service';
import { EMPTY, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { BroadcastService } from './broadcast.service';
import { EditingService } from './editing.service';
import { ElementTypesService } from './element-types.service';
import { SecurityHandlerService } from './handlers/security-handler.service';
import { SharedService } from './shared.service';
import { MessageHandlerService } from './utility/message-handler.service';
import { UserSettingsHandlerService } from './utility/user-settings-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ModelTreeService implements OnDestroy {

  currentNode?: FlatNode;

  private unsubscribe$ = new Subject();

  constructor(
    private resources: MdmResourcesService,
    private sharedService: SharedService,
    private userSettingsHandler: UserSettingsHandlerService,
    private subscribedCatalogues: SubscribedCataloguesService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private elementTypes: ElementTypesService,
    private broadcast: BroadcastService,
    private dialog: MatDialog,
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

  getLocalCatalogueTreeNodes(noCache?: boolean): Observable<MdmTreeItem[]> {
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
      .list(ContainerDomainType.Folders, options.queryStringParams)
      .pipe(
        map((response: MdmTreeItemListResponse) => response.body)
      );
  }

  getSubscribedCatalogueTreeNodes(): Observable<MdmTreeItem[]> {
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
        map((catalogues: SubscribedCatalogue[]) => catalogues.map(item => Object.assign<{}, MdmTreeItem>({}, {
          id: item.id,
          domainType: CatalogueItemDomainType.SubscribedCatalogue,
          hasChildren: true,
          label: item.label,
          availableActions: []
        }))),
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the Subscribed Catalogues.', error);
          return EMPTY;
        }),
      );
  }

  createRootNode(children?: MdmTreeItem[]): MdmTreeItem {
    return Object.assign<{}, MdmTreeItem>({}, {
      id: '',
      domainType: CatalogueItemDomainType.Root,
      children,
      hasChildren: true,
      isRoot: true,
      availableActions: []
    });
  }

  createLocalCatalogueNode(children?: MdmTreeItem[]): MdmTreeItem {
    return Object.assign<{}, MdmTreeItem>({}, {
      id: '4aa2444c-ed08-471b-84dd-96f6b3b4a00a',
      domainType: CatalogueItemDomainType.LocalCatalogue,
      label: 'This catalogue',
      hasChildren: true,
      children,
      availableActions: []
    });
  }

  createExternalCataloguesNode(children?: MdmTreeItem[]): MdmTreeItem {
    return Object.assign<{}, MdmTreeItem>({}, {
      id: '30dca3f9-5cf5-41a8-97eb-fd2dab2d4c20',
      domainType: CatalogueItemDomainType.ExternalCatalogues,
      label: 'External catalogues',
      hasChildren: true,
      children,
      availableActions: []
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
  getFederatedDataModelNodes(catalogueId: string): Observable<MdmTreeItem[]> {
    return this.subscribedCatalogues
      .getFederatedDataModels(catalogueId)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting federated data models from a subscribed catalogue.', error);
          return EMPTY;
        }),
        map(models => models.map(item => Object.assign<{}, MdmTreeItem>({}, {
          id: item.modelId,
          domainType: CatalogueItemDomainType.FederatedDataModel,
          hasChildren: false,
          label: item.label,
          modelVersion: item.version,
          parentId: item.catalogueId,
          availableActions: []
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
  createNewFolder(settings: { allowVersioning?: boolean; parentFolderId?: Uuid }): Observable<FolderDetailResponse | VersionedFolderDetailResponse> {
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

  deleteCatalogueItemSoft(item: Modelable): Observable<void> {
    return this.dialog
      .openConfirmationAsync({
        data: {
          title: `Are you sure you want to delete '${item.label}'?`,
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">This item will be marked as deleted and will not be viewable by users </p>
                  <p class="marginless">except Administrators.</p>`
        }
      })
      .pipe(
        switchMap(() => this.deleteCatalogueItem(item, false))
      );
  }

  deleteCatalogueItemPermanent(item: Modelable): Observable<void> {
    if (!this.securityHandler.isAdmin()) {
      this.messageHandler.showWarning('Only administrators may permanently delete catalogue items.');
      return of();
    }

    return this.dialog
      .openDoubleConfirmationAsync({
        data: {
          title: 'Permanent deletion',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `Are you sure you want to <span class=\'warning\'>permanently</span> delete '${item.label}'?`
        }
      }, {
        data: {
          title: 'Confirm permanent deletion',
          okBtnTitle: 'Confirm deletion',
          btnType: 'warn',
          message: '<strong>Note: </strong> This item and all its contents will be deleted <span class=\'warning\'>permanently</span>.'
        }
      })
      .pipe(
        switchMap(() => this.deleteCatalogueItem(item, true))
      );
  }

  private deleteCatalogueItem(item: Modelable, permanent: boolean): Observable<void> {
    const baseTypes = this.elementTypes.getBaseTypes();
    const type = baseTypes[item.domainType];
    if (!type) {
      return throwError(`Cannot find resource name for domain type '${item.domainType}'`);
    }

    return this.resources[type.resourceName]
      .remove(item.id, { permanent })
      .pipe(
        map(() => this.messageHandler.showSuccess(`Successfully deleted '${item.label}'`)),
        catchError(error => {
          this.messageHandler.showError(`There was a problem deleting '${item.label}'.`, error);
          return EMPTY;
        })
      );
  }
}