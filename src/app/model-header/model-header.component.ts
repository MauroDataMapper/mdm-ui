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
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  Branchable,
  CatalogueItemDetail,
  CatalogueItemDomainType,
  catalogueItemToMultiFacetAware,
  Exporter,
  isModelDomainType,
  MdmTreeItem,
  MergableCatalogueItem,
  ModelDomain,
  Securable
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MauroItemRemoveService } from '@mdm/mauro/mauro-item-remove.service';
import { MauroItemUpdateService } from '@mdm/mauro/mauro-item-update.service';
import { MauroIdentifier, MauroItem } from '@mdm/mauro/mauro-item.types';
import { MauroModelVersioningService } from '@mdm/mauro/mauro-model-versioning.service';
import { defaultBranchName } from '@mdm/modals/change-branch-name-modal/change-branch-name-modal.component';
import {
  FinaliseModalComponent,
  FinaliseModalResponse
} from '@mdm/modals/finalise-modal/finalise-modal.component';
import { SecurityAccessResource } from '@mdm/modals/security-modal/security-modal.model';
import { VersioningGraphModalComponent } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.component';
import { VersioningGraphModalConfiguration } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.model';
import { Access } from '@mdm/model/access';
import {
  BroadcastService,
  ElementTypesService,
  ExportHandlerService,
  MessageHandlerService,
  SecurityHandlerService,
  StateHandlerService
} from '@mdm/services';
import { ModelTreeService } from '@mdm/services/model-tree.service';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, filter, finalize, map, switchMap } from 'rxjs/operators';

export type ModelHeaderCatalogueItem = CatalogueItemDetail &
  Securable &
  Branchable;

@Component({
  selector: 'mdm-model-header',
  templateUrl: './model-header.component.html',
  styleUrls: ['./model-header.component.scss']
})
export class ModelHeaderComponent implements OnInit {
  @Input() item: ModelHeaderCatalogueItem;
  @Input() busy = false;
  @Input() compareModelsList: any[] = []; // TODO: define better type

  isLoggedIn: boolean;
  isAdministrator = false;
  access: Access;
  downloadLinks: HTMLAnchorElement[] = [];
  ancestorTreeItems: MdmTreeItem[] = [];

  constructor(
    private security: SecurityHandlerService,
    private dialog: MatDialog,
    private elementTypes: ElementTypesService,
    private stateHandler: StateHandlerService,
    private itemUpdates: MauroItemUpdateService,
    private messageHandler: MessageHandlerService,
    private exportHandler: ExportHandlerService,
    private modelVersioning: MauroModelVersioningService,
    private itemRemoval: MauroItemRemoveService,
    private broadcast: BroadcastService,
    private modelTree: ModelTreeService
  ) {}

  get isFinalisable() {
    if (!this.item) {
      return false;
    }
    return (
      isModelDomainType(this.item.domainType) ||
      this.item.domainType === CatalogueItemDomainType.VersionedFolder
    );
  }

  get isChildItem() {
    if (!this.item) {
      return false;
    }

    return !!this.item.breadcrumbs;
  }

  get canExport() {
    if (!this.item) {
      return false;
    }
    return isModelDomainType(this.item.domainType);
  }

  get canBulkEdit() {
    if (!this.item) {
      return false;
    }
    return (
      this.access.showEdit &&
      (this.item.domainType === CatalogueItemDomainType.DataModel ||
        this.item.domainType === CatalogueItemDomainType.DataClass ||
        this.item.domainType === CatalogueItemDomainType.CodeSet ||
        this.item.domainType === CatalogueItemDomainType.Terminology)
    );
  }

  get canCompareModels() {
    if (!this.item) {
      return false;
    }

    return (
      this.isLoggedIn &&
      this.item.domainType === CatalogueItemDomainType.DataModel
    );
  }

  get canShowMergeGraph() {
    if (!this.item) {
      return false;
    }

    return (
      this.isLoggedIn &&
      (this.item.domainType === CatalogueItemDomainType.DataModel ||
        this.item.domainType === CatalogueItemDomainType.VersionedFolder)
    );
  }

  get canChangeBranchName() {
    if (!this.item) {
      return false;
    }

    if (
      !(
        isModelDomainType(this.item.domainType) ||
        this.item.domainType === CatalogueItemDomainType.VersionedFolder
      )
    ) {
      return false;
    }

    const model = this.item as Branchable;
    return this.access.showEdit && model.branchName !== defaultBranchName;
  }

  get canRestore() {
    if (!this.item) {
      return false;
    }

    return (
      this.item.deleted &&
      this.isAdministrator &&
      isModelDomainType(this.item.domainType)
    );
  }

  get canSoftDelete() {
    if (!this.item) {
      return false;
    }

    return isModelDomainType(this.item.domainType);
  }
  
  get canCopy() {
    if (!this.item) {
      return false;
    }

    if (![CatalogueItemDomainType.DataModel, CatalogueItemDomainType.Terminology, CatalogueItemDomainType.CodeSet,  CatalogueItemDomainType.DataClass, CatalogueItemDomainType.DataElement, CatalogueItemDomainType.Term].includes(this.item.domainType)) {
      return false;
    }

    if ([CatalogueItemDomainType.DataModel, CatalogueItemDomainType.Terminology, CatalogueItemDomainType.CodeSet].includes(this.item.domainType)) {
      // need to check it is in a versionedfolder
      // has a ancestor with a domaintype.versionedfolder property
      return this.ancestorTreeItems.some(item => item.domainType === CatalogueItemDomainType.VersionedFolder);

    }

    return this.item.availableActions.includes('update');
  }



  get hasMenuOptions() {
    if (!this.item) {
      return false;
    }

    return (
      this.canChangeBranchName ||
      this.canBulkEdit ||
      this.canCompareModels ||
      this.access.showDelete ||
      this.canRestore
    );
  }

  ngOnInit(): void {
    this.isLoggedIn = this.security.isLoggedIn();
    this.access = this.security.elementAccess(this.item);
    this.security
      .isAdministrator()
      .subscribe((state) => (this.isAdministrator = state));

    if (this.item) {
      this.modelTree
        .getAncestors(this.item)
        .pipe(
          map((rootItem) => {
            const itemList: MdmTreeItem[] = [];
            this.flattenTreeItemChildren(rootItem, itemList);
            return itemList;
          })
        )
        .subscribe((ancestorTreeItems) => {
          // Exclude the item being shown (not relevant to display twice)
          this.ancestorTreeItems = ancestorTreeItems.filter(
            (treeItem) => treeItem.id !== this.item.id
          );
          console.log(this.ancestorTreeItems);
        });
    }
  }

  openUserGroupAccessDialog() {
    const type = this.elementTypes.getBaseTypeForDomainType(
      this.item.domainType
    );
    this.dialog.openSecurityAccess(
      this.item,
      type.resourceName as SecurityAccessResource
    );
  }

  bulkEdit() {
    const stateName =
      this.item.domainType === CatalogueItemDomainType.DataClass
        ? 'appContainer.mainApp.bulkEditDataClass'
        : 'appContainer.mainApp.bulkEdit';

    this.stateHandler.Go(stateName, {
      id: this.item.id,
      domainType: this.item.domainType,
      ...(this.item.model && { dataModelId: this.item.model }),
      ...(this.item.parentDataClass && {
        dataClassId: this.item.parentDataClass
      })
    });
  }

  copy() {
    switch (this.item.domainType) {
      case CatalogueItemDomainType.Term: {
        return this.stateHandler.Go('termCopy', {
          id: this.item.id,
          terminologyId: this.item.terminology.id,
          domainType: this.item.domainType
        });
      }
      case CatalogueItemDomainType.DataClass: {
        return this.stateHandler.Go('dataClassCopy', {
          id: this.item.id,
          domainType: this.item.domainType,
          dataModelId: this.item.model
        });
      }
      case CatalogueItemDomainType.DataElement: {
        return this.stateHandler.Go('dataElementCopy', {
          id: this.item.id,
          dataModelId: this.item.model,
          dataClassId: this.item.dataClass,
          domainType: this.item.domainType
        });
      }
      case CatalogueItemDomainType.DataModel: {
        return this.stateHandler.Go('containerCopy', {
          id: this.item.id,
          domainType: this.item.domainType
        });
      }
      case CatalogueItemDomainType.Terminology: {
        return this.stateHandler.Go('containerCopy', {
          id: this.item.id,
          domainType: this.item.domainType
        });
      }
      case CatalogueItemDomainType.CodeSet: {
        return this.stateHandler.Go('containerCopy', {
          id: this.item.id,
          domainType: this.item.domainType
        });
      }
      default:
        this.messageHandler.showError(
          `Cannot get catalogue item details for ${this.item.domainType} ${this.item.label}: unrecognised domain type.`
        );
    }
  }

  merge() {
    return this.stateHandler.Go('mergediff', {
      sourceId: this.item.id,
      catalogueDomainType: catalogueItemToMultiFacetAware(this.item.domainType)
    });
  }

  showMergeGraph() {
    this.dialog.open<
      VersioningGraphModalComponent,
      VersioningGraphModalConfiguration
    >(VersioningGraphModalComponent, {
      data: {
        catalogueItem: this.item as MergableCatalogueItem
      },
      panelClass: 'versioning-graph-modal'
    });
  }

  compare(dataModel = null) {
    this.stateHandler.NewWindow(
      'modelscomparison',
      {
        sourceId: this.item.id,
        targetId: dataModel ? dataModel.id : null
      },
      null
    );
  }

  newVersion() {
    this.stateHandler.Go('newVersionModel', {
      id: this.item.id,
      domainType: this.item.domainType
    });
  }

  editLabel() {
    this.dialog
      .openChangeLabel(this.item)
      .pipe(
        switchMap((change) => {
          const identifier: MauroIdentifier = {
            id: this.item.id,
            domainType: this.item.domainType,
            ...(this.item.model && { model: this.item.model }),
            ...(this.item.parentDataClass && {
              parentDataClass: this.item.parentDataClass
            }),
            ...(this.item.dataClass && { dataClass: this.item.dataClass })
          };

          const isTerm = this.item.domainType === CatalogueItemDomainType.Term;

          // Payload must match definition of domain type. For terms, we're actually updating
          // the "definition" of the term, since the label is the combination of term code and
          // definition
          const payload: MauroItem = {
            ...identifier,
            ...(!isTerm && { label: change.label }),
            ...(isTerm && { label: this.item.label, definition: change.label })
          };

          this.busy = true;
          return this.itemUpdates.save(identifier, payload);
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem updating the title.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.busy = false))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('The title was updated successfully.');
        this.stateHandler.reload();
      });
  }

  editBranchName() {
    this.dialog
      .openChangeBranchName(this.item)
      .pipe(
        switchMap((change) => {
          const identifier: MauroIdentifier = {
            id: this.item.id,
            domainType: this.item.domainType
          };

          const payload: MauroItem = {
            ...identifier,
            label: this.item.label,
            branchName: change.branchName
          };

          this.busy = true;
          return this.itemUpdates.save(identifier, payload);
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem updating the branch name.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.busy = false))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          'The branch name was updated successfully.'
        );
        this.stateHandler.reload();
      });
  }

  finalise() {
    this.modelVersioning
      .getLatestModelVersion(this.item)
      .pipe(
        switchMap((response) => {
          return this.dialog
            .open<FinaliseModalComponent, any, FinaliseModalResponse>(
              FinaliseModalComponent,
              {
                data: {
                  modelVersion: response.modelVersion,
                  title: 'Finalise',
                  okBtnTitle: 'Finalise',
                  btnType: 'accent',
                  message:
                    'Please select the version you would like this item to be finalised with.'
                }
              }
            )
            .afterClosed();
        }),
        filter(
          (dialogResponse) => dialogResponse?.status === ModalDialogStatus.Ok
        ),
        switchMap((dialogResponse) => {
          this.busy = true;
          return this.modelVersioning.finalise(
            this.item,
            dialogResponse.request
          );
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem finalising the item.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.busy = false))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          `'${this.item.label}' finalised successfully.`
        );
        this.stateHandler.reload();
      });
  }

  exportModel() {
    const type = this.elementTypes.getBaseTypeForDomainType(
      this.item.domainType
    );

    const modelDomain = type.domainName as ModelDomain;

    this.dialog
      .openExportModel({ domain: modelDomain })
      .pipe(
        switchMap((response) => {
          this.busy = true;

          return forkJoin([
            of(response.exporter),
            this.exportHandler.exportDataModel(
              [this.item],
              response.exporter,
              modelDomain,
              response.parameters
            )
          ]);
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem exporting the model.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.busy = false))
      )
      .subscribe(([exporter, response]) => {
        if (response.status === 202) {
          this.handleAsyncExporterResponse();
          return;
        }

        this.handleStandardExporterResponse(exporter, response);
      });
  }

  askForSoftDelete() {
    if (!this.access.showSoftDelete) {
      return;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure you want to delete this item?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">This item will be marked as deleted and will not be viewable by users </p>
                    <p class="marginless">except Administrators.</p>`
        }
      })
      .subscribe(() => this.deleteItem(false));
  }

  askForPermanentDelete() {
    if (!this.access.showPermanentDelete) {
      return;
    }

    this.dialog
      .openDoubleConfirmationAsync(
        {
          data: {
            title: 'Permanent deletion',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message:
              'Are you sure you want to <span class="warning">permanently</span> delete this item?'
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message: `<p class='marginless'><strong>Note: </strong>This catalogue item and everything underneath it
                    <p class='marginless'>will be deleted <span class='warning'>permanently</span>.</p>`
          }
        }
      )
      .subscribe(() => this.deleteItem(true));
  }

  restore() {
    if (!this.isAdministrator || !this.item.deleted) {
      return;
    }

    this.busy = true;

    this.itemRemoval
      .restore(this.item)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem restoring the item.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.busy = false))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          `"${this.item.label}" has been restored.`
        );
        this.stateHandler.reload();
      });
  }

  deleteItem(permanent: boolean) {
    this.busy = true;
    this.itemRemoval
      .remove(this.item, { permanent })
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem deleting the item.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.busy = false))
      )
      .subscribe(() => {
        if (permanent) {
          this.messageHandler.showSuccess(
            `'${this.item.label} has been permanently deleted.`
          );
          this.broadcast.reloadCatalogueTree();
          this.stateHandler.Go(
            'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
          );
        } else {
          this.stateHandler.reload();
        }
      });
  }

  private handleStandardExporterResponse(
    exporter: Exporter,
    response: HttpResponse<ArrayBuffer>
  ) {
    const fileName = this.exportHandler.createFileName(
      this.item.label,
      exporter
    );
    const file = new Blob([response.body], {
      type: exporter.fileType
    });
    const link = this.exportHandler.createBlobLink(file, fileName);
    this.downloadLinks.push(link);
  }

  private handleAsyncExporterResponse() {
    this.messageHandler.showInfo(
      'A new background task to export your model has started. You can continue working while the export continues.'
    );
  }

  private flattenTreeItemChildren(item: MdmTreeItem, itemList: MdmTreeItem[]) {
    itemList.push(item);

    if (!item || !item.children || item.children.length === 0) {
      return;
    }

    item.children.forEach((child) => {
      this.flattenTreeItemChildren(child, itemList);
    });
  }
}
