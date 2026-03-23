/*
Copyright 2020-2025 University of Oxford and NHS England

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
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { EMPTY } from 'rxjs';
import { Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { getCatalogueItemDomainTypeIcon } from '@mdm/folders-tree/flat-node';
import { Access } from '@mdm/model/access';
import { MdmResourcesService } from '@mdm/modules/resources';
import { FolderService } from '@mdm/folders-tree/folder.service';
import { ModelTreeService } from '@mdm/services/model-tree.service';
import {
  BroadcastService,
  FavouriteHandlerService,
  SecurityHandlerService,
  StateHandlerService
} from '@mdm/services';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import {
  CatalogueItemDomainType,
  isContainerDomainType,
  isModelDomainType,
  Securable
} from '@maurodatamapper/mdm-resources';
import {
  MauroItemTreeFlatNode,
  MauroTreeViewDataSource
} from './mauro-item-tree.types';
import {
  ModelsTreeTab,
  ModelsTreeTabStateService
} from '@mdm/shared/models/models-tree-tab-state.service';
import { ElementLabelComponent } from '../element-label/element-label.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatIcon } from '@angular/material/icon';
import { NgTemplateOutlet, NgClass, NgIf } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import {
  MatMenu,
  MatMenuContent,
  MatMenuItem,
  MatMenuTrigger
} from '@angular/material/menu';
import { MatTree, MatTreeNodeDef, MatTreeNode, MatTreeNodePadding, MatTreeNodeToggle } from '@angular/material/tree';

@Component({
    selector: 'mdm-mauro-item-tree',
    templateUrl: './mauro-item-tree.component.html',
    styleUrls: ['./mauro-item-tree.component.scss'],
    standalone: true,
    imports: [MatTree, MatTreeNodeDef, MatTreeNode, MatTreeNodePadding, MatIconButton, NgTemplateOutlet, MatTreeNodeToggle, MatIcon, NgClass, ExtendedModule, NgIf, ElementLabelComponent, MatMenuTrigger, MatMenu, MatMenuContent, MatMenuItem]
})
export class MauroItemTreeComponent implements OnChanges {
  /**
   * The collection of root level nodes to display.
   */
  @Input() nodes: MauroItemTreeFlatNode[] = [];

  /**
   * Optional preferred models tree tab to reopen after wizard navigation.
   */
  @Input() wizardReturnTab?: ModelsTreeTab;

  /**
   * Event emitted when the selected node has changed.
   */
  @Output() selectionChange = new EventEmitter<MauroItemTreeFlatNode>();

  /**
   * Event emitted when a node should be focused in the broader models tree.
   */
  @Output() focusChange = new EventEmitter<MauroItemTreeFlatNode>();

  @ViewChild('contextMenuTrigger')
  contextMenuTrigger?: MatMenuTrigger;

  treeControl: FlatTreeControl<MauroItemTreeFlatNode>;
  dataSource: MauroTreeViewDataSource;
  selected?: MauroItemTreeFlatNode;
  contextMenuPosition = { x: '0', y: '0' };
  targetVersions = [];
  private expandedNodeIds = new Set<string>();
  private pendingExpandedNodeIds = new Set<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private resources: MdmResourcesService,
    private modelTree: ModelTreeService,
    private securityHandler: SecurityHandlerService,
    private broadcast: BroadcastService,
    private favouriteHandler: FavouriteHandlerService,
    private stateHandler: StateHandlerService,
    private messageHandler: MessageHandlerService,
    private folderService: FolderService,
    private modelsTreeTabState: ModelsTreeTabStateService
  ) {
    this.treeControl = new FlatTreeControl<MauroItemTreeFlatNode>(
      this.getLevel,
      this.isExpandable
    );

    this.dataSource = new MauroTreeViewDataSource(
      this.treeControl,
      this.resources,
      this.modelTree
    );

    this.treeControl.expansionModel.changed
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((change) => {
        change.added?.forEach(node => this.expandedNodeIds.add(node.id));
        change.removed?.forEach(node => this.expandedNodeIds.delete(node.id));
      });

    this.dataSource.dataChange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.reapplyExpandedState());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nodes) {
      if (this.shouldRememberExpandedStates()) {
        this.pendingExpandedNodeIds = new Set(this.expandedNodeIds);
      }

      this.dataSource.data = this.nodes;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getLevel = (node: MauroItemTreeFlatNode) => node.level;

  isExpandable = (node: MauroItemTreeFlatNode) => node.expandable;

  hasChild = (_: number, node: MauroItemTreeFlatNode) => node.expandable;

  getIcon(node: MauroItemTreeFlatNode) {
    return getCatalogueItemDomainTypeIcon(
      node.domainType,
      node,
      this.treeControl
    );
  }

  hasIcon(node: MauroItemTreeFlatNode) {
    return this.getIcon(node) !== null;
  }

  nodeClicked(node: MauroItemTreeFlatNode) {
    this.selected = node;
    this.selectionChange.emit(node);
  }

  noop(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  async onContextMenu(node: MauroItemTreeFlatNode, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // TODO: remove these exceptions when there are suitable actions to use for these domain types
    if (node.domainType === CatalogueItemDomainType.Term) {
      return;
    }

    node.access = this.getAccess(node);
    this.contextMenuPosition.x = `${event.clientX}px`;
    this.contextMenuPosition.y = `${event.clientY}px`;

    if (this.contextMenuTrigger) {
      this.contextMenuTrigger.menuData = { node };
      this.contextMenuTrigger.openMenu();
    }

    this.targetVersions = node.domainType === CatalogueItemDomainType.DataModel
      ? await this.folderService.loadVersions(node)
      : [];
  }

  canCreateElements(node: MauroItemTreeFlatNode) {
    const access = this.getAccess(node);
    if (!access.canCreate) {
      return false;
    }

    // TODO: remove these exceptions when there are suitable actions to use for these domain types
    if (
      node.domainType === CatalogueItemDomainType.CodeSet
      || node.domainType === CatalogueItemDomainType.Terminology
      || node.domainType === CatalogueItemDomainType.ReferenceDataModel
    ) {
      return false;
    }

    return true;
  }

  canDeleteElements(node: MauroItemTreeFlatNode) {
    const access = this.getAccess(node);
    if (!access.showDelete) {
      return false;
    }

    // TODO: remove these exceptions when there are suitable ways to accommodate them - these domain
    // types have `remove` endpoints with multiple parent ids
    if (
      node.domainType === CatalogueItemDomainType.DataElement
      || node.domainType === CatalogueItemDomainType.DataClass
    ) {
      return false;
    }

    return true;
  }

  canCompare(node: MauroItemTreeFlatNode) {
    return node.domainType === CatalogueItemDomainType.DataModel;
  }

  canAddToFavorites(node: MauroItemTreeFlatNode) {
    return (
      isContainerDomainType(node.domainType)
      || isModelDomainType(node.domainType)
    );
  }

  canSetTreeFocus(node: MauroItemTreeFlatNode) {
    return (
      isContainerDomainType(node.domainType)
      || node.domainType === CatalogueItemDomainType.DataModel
      || node.domainType === CatalogueItemDomainType.Terminology
    );
  }

  focusNode(node: MauroItemTreeFlatNode) {
    this.focusChange.emit(node);
  }

  handleFavourites(node: MauroItemTreeFlatNode) {
    this.favouriteHandler.toggle(node);
  }

  handleAddFolder(node: MauroItemTreeFlatNode) {
    const access = this.getAccess(node);
    const allowVersioning = access.canCreateVersionedFolder;

    this.modelTree
      .createNewFolder({ parentFolderId: node.id, allowVersioning })
      .pipe(
        finalize(() => this.refreshFavouritesIfRequired(node)),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem creating the Folder.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response) => {
        this.messageHandler.showSuccess('Folder created successfully.');
        this.stateHandler.Go(response.body.domainType, { id: response.body.id });
      });
  }

  handleAddDataModel(node: MauroItemTreeFlatNode) {
    this.setWizardReturnTab();
    this.stateHandler.Go('NewDataModel', {
      parentFolderId: node.id,
      parentDomainType: node.domainType
    });
  }

  handleAddTerminology(node: MauroItemTreeFlatNode) {
    this.setWizardReturnTab();
    this.stateHandler.Go('NewTerminology', {
      parentFolderId: node.id,
      parentDomainType: node.domainType
    });
  }

  handleAddCodeSet(node: MauroItemTreeFlatNode) {
    this.setWizardReturnTab();
    this.stateHandler.Go('NewCodeSet', {
      parentFolderId: node.id,
      parentDomainType: node.domainType
    });
  }

  handleAddReferenceDataModel(node: MauroItemTreeFlatNode) {
    this.setWizardReturnTab();
    this.stateHandler.Go('NewReferenceDataModel', {
      parentFolderId: node.id,
      parentDomainType: node.domainType
    });
  }

  handleAddDataClass(node: MauroItemTreeFlatNode) {
    this.setWizardReturnTab();
    this.stateHandler.Go('NewDataClass', {
      grandParentDataClassId:
        node.domainType === CatalogueItemDomainType.DataClass
          ? node.parentId
          : null,
      parentDataModelId:
        node.domainType === CatalogueItemDomainType.DataModel
          ? node.id
          : node.modelId,
      parentDataClassId:
        node.domainType === CatalogueItemDomainType.DataModel ? null : node.id
    });
  }

  handleAddDataElement(node: MauroItemTreeFlatNode) {
    this.setWizardReturnTab();
    this.stateHandler.Go('NewDataElement', {
      grandParentDataClassId: node.parentId ? node.parentId : null,
      parentDataModelId: node.modelId,
      parentDataClassId: node.id
    });
  }

  handleAddDataType(node: MauroItemTreeFlatNode) {
    this.setWizardReturnTab();
    this.stateHandler.Go('NewDataType', { parentDataModelId: node.id });
  }

  handleSoftDelete(node: MauroItemTreeFlatNode) {
    if (!this.getAccess(node).showSoftDelete) {
      return;
    }

    this.modelTree.deleteCatalogueItemSoft(node).subscribe(() => {
      node.deleted = true;
    });
  }

  handlePermanentDelete(node: MauroItemTreeFlatNode) {
    if (!this.getAccess(node).showPermanentDelete) {
      return;
    }

    this.modelTree.deleteCatalogueItemPermanent(node).subscribe(() => {
      this.removeNode(node);
    });
  }

  handleDataModelCompare(node: MauroItemTreeFlatNode, targetVersion = null) {
    this.stateHandler.NewWindow('modelscomparison', {
      sourceId: node.id,
      targetId: targetVersion ? targetVersion.id : null
    });
  }

  openWindow(node: MauroItemTreeFlatNode) {
    const parameters: Record<string, unknown> = { id: node.id };

    if (node.domainType === CatalogueItemDomainType.DataClass) {
      parameters.dataModelId = node.modelId;
      parameters.dataClassId = node.parentId || '';
    }

    this.stateHandler.NewWindow(
      node.domainType.toLocaleLowerCase(),
      parameters
    );
  }

  isFavourited(node: MauroItemTreeFlatNode) {
    return this.favouriteHandler.isAdded(node);
  }

  private getAccess(node: MauroItemTreeFlatNode): Access {
    if (!node.access) {
      node.access = this.securityHandler.elementAccess(
        node as unknown as Securable
      );
    }

    return node.access;
  }

  private removeNode(node: MauroItemTreeFlatNode) {
    const data = [...this.dataSource.data];
    const index = data.indexOf(node);
    if (index < 0) {
      return;
    }

    let count = 1;
    while (index + count < data.length && data[index + count].level > node.level) {
      count++;
    }

    data.splice(index, count);
    this.dataSource.data = data;
  }

  private setWizardReturnTab() {
    if (this.wizardReturnTab) {
      this.modelsTreeTabState.setNextActiveTab(this.wizardReturnTab);
    }
  }

  private refreshFavouritesIfRequired(node: MauroItemTreeFlatNode) {
    if (this.wizardReturnTab === 'favourites') {
      this.broadcast.favouritesChanged({
        name: 'add',
        element: node
      });
    }
  }

  private reapplyExpandedState() {
    if (!this.shouldRememberExpandedStates() || this.pendingExpandedNodeIds.size === 0) {
      return;
    }

    this.treeControl.dataNodes.forEach((node) => {
      if (
        this.pendingExpandedNodeIds.has(node.id)
        && node.expandable
        && !this.treeControl.isExpanded(node)
      ) {
        this.treeControl.expand(node);
      }

      if (this.treeControl.isExpanded(node)) {
        this.pendingExpandedNodeIds.delete(node.id);
      }
    });
  }

  private shouldRememberExpandedStates() {
    return this.wizardReturnTab === 'favourites';
  }
}
