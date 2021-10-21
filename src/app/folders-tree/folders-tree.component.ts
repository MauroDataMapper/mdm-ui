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
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { EMPTY, of, Subject, Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { FlatNode, getCatalogueItemDomainTypeIcon } from './flat-node';
import { MatDialog } from '@angular/material/dialog';
import { FolderService } from './folder.service';
import { MessageService, SecurityHandlerService, FavouriteHandlerService, StateHandlerService, BroadcastService, SharedService } from '@mdm/services';
import { ModelTreeService } from '@mdm/services/model-tree.service';
import { catchError, takeUntil } from 'rxjs/operators';
import { CatalogueItemDomainType, isContainerDomainType, isModelDomainType, MdmTreeItem } from '@maurodatamapper/mdm-resources';

/**
 * Event arguments for confirming a click of a node in the FoldersTreeComponent.
 */
export class NodeConfirmClickEvent {

  constructor(
    public current: FlatNode,
    public next: FlatNode,
    private broadcast: BroadcastService) {
  }

  setSelectedNode = (node: FlatNode) => this.broadcast.catalogueTreeNodeSelected({ node });
}

@Component({
  selector: 'mdm-folders-tree',
  templateUrl: './folders-tree.component.html',
  styleUrls: ['./folders-tree.component.scss']
})
export class FoldersTreeComponent implements OnChanges, OnDestroy {

  @Input() node: any;
  @Input() searchCriteria: string;
  @Input() defaultCheckedMap: any = {};

  @Output() nodeClickEvent = new EventEmitter<MdmTreeItem>();
  @Output() nodeConfirmClickEvent = new EventEmitter<NodeConfirmClickEvent>();
  @Output() nodeDbClickEvent = new EventEmitter<MdmTreeItem>();
  @Output() nodeCheckedEvent = new EventEmitter<any>();
  @Output() nodeAdded = new EventEmitter<MdmTreeItem>();

  @Output() compareToEvent = new EventEmitter<any>();
  @Output() loadModelsToCompareEvent = new EventEmitter<any>();

  @Input() doNotShowDataClasses: any;
  @Input() doNotShowTerms: any;
  @Input() justShowFolders: any;
  @Input() showCheckboxFor: any; // it is an array of domainTypes like ['DataClass';'DataModel';'Folder']
  @Input() propagateCheckbox: any;
  @Input() enableDragAndDrop = false;
  @Input() enableContextMenu = false;
  @Input() rememberExpandedStates = false;
  @Input() expandOnNodeClickFor: any;
  @Input() doNotMakeSelectedBold: any;
  @Input() filterByDomainType: CatalogueItemDomainType[];

  @Input() treeName = 'unnamed';

  @Input() inSearchMode: any;

  @Input() initialExpandedPaths: string[];
  @Input() isComparisonTree = false;

  @Input() selectedNode: FlatNode = null; // Control highlighting

  @ViewChild(MatMenuTrigger, { static: false }) contextMenuTrigger: MatMenuTrigger;
  contextMenuPosition = { x: '0', y: '0' };

  favourites: { [x: string]: any };
  subscriptions: Subscription = new Subscription();
  checkedList = this.defaultCheckedMap || {};

  targetVersions = [];
  expandedPaths = [];

  draggableDomains = [
    CatalogueItemDomainType.Folder,
    CatalogueItemDomainType.DataModel,
    CatalogueItemDomainType.Terminology,
    CatalogueItemDomainType.CodeSet,
    CatalogueItemDomainType.ReferenceDataModel
  ];
  droppableDomains = [CatalogueItemDomainType.Folder];
  draggedTreeNode: FlatNode;
  showDropTopPlaceHolder = false;

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<MdmTreeItem, FlatNode>;

  folder = '';

  expandedNodeSet = new Set<string>();

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  protected treeFlattener: MatTreeFlattener<MdmTreeItem, FlatNode>;

  private unsubscribe$ = new Subject();

  /**
   * Get the children for the given node from source data.
   *
   * Defined as property to retain reference to `this`.
   */

  constructor(
    protected messages: MessageService,
    protected resources: MdmResourcesService,
    protected securityHandler: SecurityHandlerService,
    protected favouriteHandler: FavouriteHandlerService,
    protected folderService: FolderService,
    protected stateHandler: StateHandlerService,
    protected messageHandler: MessageHandlerService,
    private broadcast: BroadcastService,
    public dialog: MatDialog,
    private modelTree: ModelTreeService,
    private shared: SharedService) {
    this.loadFavourites();
    this.subscriptions.add(this.messages.on('favourites', () => {
      this.loadFavourites();
    }));

    this.treeFlattener = new MatTreeFlattener(
      (node: MdmTreeItem, level: number) => new FlatNode(node, level, this.securityHandler.elementAccess(node)),
      (node: FlatNode) => node.level,
      (node: FlatNode) => node?.hasChildren || node?.hasChildFolders,
      this.getChildren);

    this.treeControl = new FlatTreeControl((node: FlatNode) => node.level, (node: FlatNode) => node.hasChildren || node.hasChildFolders);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener, []);

    if (this.shared.features.useVersionedFolders) {
      this.draggableDomains.push(CatalogueItemDomainType.VersionedFolder);
      this.droppableDomains.push(CatalogueItemDomainType.VersionedFolder);
    }

    this.broadcast
      .onCatalogueTreeNodeSelected()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => this.selectedNode = data.node);

    this.broadcast
      .onFavouritesChanged()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.loadFavourites());
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.node) {
      if (this.node?.children) {
        this.refreshTree();
      }
    }

    if (changes.initialExpandedPaths && this.node?.children) {
      if (this.initialExpandedPaths?.length > 0) {
        this.expandedPaths = this.initialExpandedPaths;
        this.refreshTree();
      }
    }

    // HACK TO FILTER CLASSIFIERS NEEDS REVISITED
    // Note 1: The domain model tree uses backend API call to get filtered results.
    if (changes.searchCriteria) {
      if (this.treeName && this.treeName === 'Classifiers' && this.searchCriteria && this.searchCriteria.trim().length > 0) {
        this.filter(this.searchCriteria);
      }
    }
  }

  loadFavourites() {
    const fs: any[] = this.favouriteHandler.get();
    this.favourites = {};
    fs.forEach(f => {
      this.favourites[f.id] = f;
    });
  }

  /** Get whether the node has children or not. Tree branch control. */
  hasChild(_: number, node: FlatNode) {
    if (node?.domainType === CatalogueItemDomainType.DataModel && this.doNotShowDataClasses) {
      return false;
    }

    if (this.expandOnNodeClickFor && !this.expandOnNodeClickFor?.includes(node?.domainType)) {
      return false;
    }

    return node?.hasChildFolders || node?.hasChildren;
  }

  /** Determine which tree node icon to use based on given node's domain type */
  getIcon(fnode: FlatNode) {
    return getCatalogueItemDomainTypeIcon(fnode.domainType, fnode, this.treeControl);
  }

  hasIcon(fnode: FlatNode) {
    return getCatalogueItemDomainTypeIcon(fnode.domainType, fnode, this.treeControl) !== null;
  }

  /** Additional CSS classes to add to the tree node. */
  getCssClass(node: FlatNode) {
    return `fa-sm ${node.deleted ? 'deleted-folder' : ''}`;
  }


  /** Asynchronously expand sub-tree */
  async toggleChildren(flatNode: FlatNode) {
    if (this.treeControl.isExpanded(flatNode)) {
      if (!this.expandedPaths.includes(this.getExpandedPaths(flatNode))) {
        this.expandedPaths.push(this.getExpandedPaths(flatNode));
        this.expandedPaths.sort();
      }
    } else {
      if (this.expandedPaths.includes(this.getExpandedPaths(flatNode))) {
        this.expandedPaths.splice(this.expandedPaths.indexOf(this.getExpandedPaths(flatNode)), 1);
        this.expandedPaths.sort();
      }
    }

    if (this.rememberExpandedStates) {
      localStorage.setItem('expandedPaths', JSON.stringify(this.expandedPaths));
    }

    if (!this.inSearchMode && !flatNode.children) {
      const data = await this.expand(flatNode.node);
      flatNode.children = data;
    }

    this.refreshTree();
  }

  handleClick(fnode: FlatNode) {
    if (this.nodeConfirmClickEvent.observers.length > 0) {
      this.nodeConfirmClickEvent.emit(new NodeConfirmClickEvent(this.selectedNode, fnode, this.broadcast));
      return;
    }

    this.selectedNode = fnode; // Control highlighting selected tree node
    this.modelTree.currentNode = fnode;
    this.nodeClickEvent.emit(fnode.node);
  }

  handleDbClick(fnode: FlatNode) {
    this.selectedNode = fnode; // Control highlighting selected tree node
    this.modelTree.currentNode = fnode;
    this.focusNode(fnode);
  }

  focusNode(fnode: FlatNode) {
    this.selectedNode = fnode; // Control highlighting selected tree node
    this.nodeDbClickEvent.emit(fnode.node);
  }

  async expand(node: MdmTreeItem) {
    try {
      switch (node.domainType) {
        case CatalogueItemDomainType.Folder:
          if (this.justShowFolders) {
            const folderResponse = await this.resources.tree.get('folders', 'folders', node.id).toPromise();
            return folderResponse.body;
          } else {
            return node.children;
          }
        case CatalogueItemDomainType.VersionedFolder:
          if (this.justShowFolders) {
            const versionedFolderResponse = await this.resources.tree.get('folders', 'versionedFolders', node.id).toPromise();
            return versionedFolderResponse.body;
          } else {
            return node.children;
          }
        case CatalogueItemDomainType.DataModel: {
          const dataModelResponse = await this.resources.tree.get('folders', 'dataModels', node.id).toPromise();
          return dataModelResponse.body;
        }
        case CatalogueItemDomainType.DataClass: {
          const dataClassResponse = await this.resources.tree.get('folders', 'dataClasses', node.id).toPromise();
          return dataClassResponse.body;
        }
        case CatalogueItemDomainType.Terminology: {
          const terminologyResponse = await this.resources.tree.get('folders', 'terminologies', node.id).toPromise();
          return terminologyResponse.body;
        }
        case CatalogueItemDomainType.Term: {
          const termResponse = await this.resources.tree.get('folders', 'terms', node.id).toPromise();
          return termResponse.body;
        }
        case CatalogueItemDomainType.SubscribedCatalogue:
          return await this.modelTree.getFederatedDataModelNodes(node.id).toPromise();
        default:
          return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  noop(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  nodeChecked(child: FlatNode) {
    const element = this.find(this.node, null, child.node.id);

    this.markChildren(child.node, child, child.checked);

    if (child.checked) {
      this.checkedList[element.node.id] = element;
    } else {
      delete this.checkedList[element.node.id];
    }

    this.nodeCheckedEvent.emit([child, null, this.checkedList]);
  }

  find(node: MdmTreeItem, parent: MdmTreeItem, id: string) {
    if (node.id === id) {
      return { node, parent };
    }
    if (node.domainType === CatalogueItemDomainType.Terminology
      || node.domainType === CatalogueItemDomainType.Folder
      || node.domainType === CatalogueItemDomainType.VersionedFolder
      || node.domainType === CatalogueItemDomainType.DataModel
      || node.domainType === CatalogueItemDomainType.DataClass
      || node.isRoot) {
      if (!node.children) {
        return null;
      }

      let i = 0;
      while (i < node.children.length) {
        const result = this.find(node.children[i], node, id);
        if (result !== null) {
          return result;
        }
        i++;
      }
    }
    return null;
  }

  markChildren(node: MdmTreeItem, root: FlatNode, status: boolean) {
    node.checked = status;
    delete this.checkedList[node.id];

    if (this.propagateCheckbox) {
      node.children?.forEach((n: MdmTreeItem) => {
        n.disableChecked = status;
        this.markChildren(n, null, status);
      });
    }
  }

  /** Context Menu */
  async onContextMenu(fnode: FlatNode, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // TODO: remove these exceptions when there are suitable actions to use for these domain types
    if (!this.enableContextMenu
      || fnode.domainType === CatalogueItemDomainType.Term) {
      return;
    }

    this.contextMenuPosition.x = `${event.clientX}px`;
    this.contextMenuPosition.y = `${event.clientY}px`;
    this.contextMenuTrigger.menuData = { node: fnode };
    this.contextMenuTrigger.openMenu();

    if (fnode.domainType === CatalogueItemDomainType.DataModel) {
      this.targetVersions = await this.folderService.loadVersions(fnode.node);
    }
  }

  canCreateElements(fnode: FlatNode) {
    if (!fnode.access.canCreate) {
      return false;
    }

    // TODO: remove these exceptions when there are suitable actions to use for these domain types
    if (fnode.domainType === CatalogueItemDomainType.CodeSet
      || fnode.domainType === CatalogueItemDomainType.Terminology
      || fnode.domainType === CatalogueItemDomainType.ReferenceDataModel) {
      return false;
    }

    return true;
  }

  canDeleteElements(fnode: FlatNode) {
    if (!fnode.access.showDelete) {
      return false;
    }

    // TODO: remove these exceptions when there are suitable ways to accomodate them - these domain
    // types have `remove` endpoints with multiple parent ids
    if (fnode.domainType === CatalogueItemDomainType.DataElement
      || fnode.domainType === CatalogueItemDomainType.DataClass) {
      return false;
    }

    return true;
  }

  canCompare(fnode: FlatNode) {
    return fnode.domainType === CatalogueItemDomainType.DataModel;
  }

  canAddToFavorites(fnode: FlatNode) {
    return isContainerDomainType(fnode.domainType) || isModelDomainType(fnode.domainType);
  }

  canSetTreeFocus(fnode: FlatNode) {
    return isContainerDomainType(fnode.domainType)
      || fnode.domainType === CatalogueItemDomainType.DataModel
      || fnode.domainType === CatalogueItemDomainType.Terminology;
  }

  handleFavourites(fnode: FlatNode) {
    this.favouriteHandler.toggle(fnode.node);
  }

  handleAddFolder(fnode: FlatNode) {
    const allowVersioning = fnode.access.canCreateVersionedFolder;
    this.modelTree
      .createNewFolder({ parentFolderId: fnode?.id, allowVersioning })
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem creating the Folder.', error);
          return EMPTY;
        })
      )
      .subscribe(response => {
        const node: MdmTreeItem = {
          id: response.body.id,
          domainType: response.body.domainType,
          label: response.body.label,
          hasChildFolders: response.body.hasChildFolders,
          hasChildren: response.body.hasChildFolders,
          availableActions: response.body.availableActions
        };

        this.messageHandler.showSuccess('Folder created successfully.');
        this.stateHandler.Go(node.domainType, { id: node.id });
        this.nodeAdded.emit(node);
      });
  }

  handleAddDataModel(fnode: FlatNode) {
    this.stateHandler.Go(
      'NewDataModel',
      {
        parentFolderId: fnode.id,
        parentDomainType: fnode.domainType
      });
  }

  handleAddCodeSet(fnode: FlatNode) {
    this.stateHandler.Go(
      'NewCodeSet',
      {
        parentFolderId: fnode.id,
        parentDomainType: fnode.domainType
      });
  }

  handleSoftDelete(fnode: FlatNode) {
    this.modelTree
      .deleteCatalogueItemSoft(fnode)
      .subscribe(() => {
        fnode.deleted = true;
      });
  }

  handlePermanentDelete(fnode: FlatNode) {
    this.modelTree
      .deleteCatalogueItemPermanent(fnode)
      .subscribe(() => {
        this.broadcast.reloadCatalogueTree();
        this.stateHandler.Go(
          'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
        );
      });
  }

  handleAddDataClass(fnode: FlatNode) {
    this.stateHandler.Go('NewDataClass', {
      grandParentDataClassId: fnode.domainType === CatalogueItemDomainType.DataClass ? fnode.node.parentId : null,
      parentDataModelId: fnode.domainType === CatalogueItemDomainType.DataModel ? fnode.id : fnode.node.modelId,
      parentDataClassId: fnode.domainType === CatalogueItemDomainType.DataModel ? null : fnode.id
    });
  }

  handleAddDataElement(fnode: FlatNode) {
    this.stateHandler.Go('NewDataElement', {
      grandParentDataClassId: fnode.node.parentId ? fnode.node.parentId : null,
      parentDataModelId: fnode.node.modelId,
      parentDataClassId: fnode.id
    });
  }

  handleAddDataType(fnode: FlatNode) {
    this.stateHandler.Go('NewDataType', { parentDataModelId: fnode.id });
  }

  handleDataModelCompare(fnode: FlatNode, targetVersion = null) {
    this.stateHandler.NewWindow('modelscomparison', {
      sourceId: fnode.id,
      targetId: targetVersion ? targetVersion.id : null
    });
  }

  handleExtendDataClass(fnode: FlatNode) {
    if (fnode.domainType !== CatalogueItemDomainType.DataModel && fnode.domainType !== CatalogueItemDomainType.DataClass) {
      throw new Error('Context item is not data model or data class.');
    }
    this.stateHandler.Go('NewDataClass', {
      grandParentDataClassId: fnode.domainType === CatalogueItemDomainType.DataClass ? fnode.node.parentId : null,
      parentDataModelId: fnode.domainType === CatalogueItemDomainType.DataModel ? fnode.id : fnode.node.modelId,
      parentDataClassId: fnode.domainType === CatalogueItemDomainType.DataModel ? null : fnode.id
    });
  }

  handleImportDataClass(fnode: FlatNode) {
    if (fnode.domainType !== CatalogueItemDomainType.DataModel && fnode.domainType !== CatalogueItemDomainType.DataClass) {
      throw new Error('Context item is not data model or data class.');
    }
    this.stateHandler.Go('NewDataClass', {
      grandParentDataClassId: fnode.domainType === CatalogueItemDomainType.DataClass ? fnode.node.parentId : null,
      parentDataModelId: fnode.domainType === CatalogueItemDomainType.DataModel ? fnode.id : fnode.node.modelId,
      parentDataClassId: fnode.domainType === CatalogueItemDomainType.DataModel ? null : fnode.id
    });
  }

  handleImportDataType(fnode: FlatNode) {
    if (fnode.domainType !== CatalogueItemDomainType.DataModel) {
      throw new Error('Context item is not data model.');
    }
    this.stateHandler.Go('NewDataType', { parentDataModelId: fnode.id });
  }

  handleImportDataElement(fnode: FlatNode) {
    if (fnode.domainType !== CatalogueItemDomainType.DataClass) {
      throw new Error('Context item is not data class.');
    }
    this.stateHandler.Go('NewDataElement', {
      grandParentDataClassId: fnode.node.parentId,
      parentDataModelId: fnode.node.modelId,
      parentDataClassId: fnode.id
    });
  }

  openWindow(fnode: FlatNode) {
    const parameters: any = { id: fnode.id };

    if (fnode.domainType === CatalogueItemDomainType.DataClass) {
      parameters.dataModelId = fnode.modelId;
    }

    this.stateHandler.NewWindow(fnode.domainType.toLocaleLowerCase(), { id: fnode.id });
  }

  isFavourited(fnode: FlatNode) {
    return this.favouriteHandler.isAdded(fnode);
  }

  get isUserAdmin() {
    return this.securityHandler.isAdmin();
  }

  isNodeFinalised(node: FlatNode) {
    return node.finalised;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Only used for Classifiers
  filter(filterText: string, sourceNodes: MdmTreeItem[] = this.node.children) {
    if (!filterText) {
      return;
    }
    const filteredTreeData: MdmTreeItem[] = sourceNodes.filter(d => d.label.toLocaleLowerCase().includes(filterText.toLocaleLowerCase()));

    filteredTreeData.forEach(ftd => {
      let str = (ftd.label);
      while (str.lastIndexOf('.') > -1) {
        const index = str.lastIndexOf('.');
        str = str.substring(0, index);
        if (filteredTreeData.findIndex(t => t.code === str) === -1) {
          const obj = this.dataSource.data.find(d => d.label === str);
          if (obj) {
            filteredTreeData.push(obj);
          }
        }
      }
    });

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    this.node.children = filteredTreeData;
    this.refreshTree();
  }

  validateLabel = (data: string) => {
    if (data) {
      return true;
    } else {
      return false;
    }
  };

  // Drag n Drop

  dragStart(node: FlatNode, e: DragEvent) {
    if (!this.enableDragAndDrop) {
      return;
    }

    e.dataTransfer.dropEffect = 'move';
    e.dataTransfer.setData('data', node.id);
    this.draggedTreeNode = node;
  }

  dragEnter(parentFolder: FlatNode, e: DragEvent) {
    if (!this.enableDragAndDrop) {
      return;
    }

    const currentNode = this.draggedTreeNode;

    if (currentNode.domainType === CatalogueItemDomainType.Folder || currentNode.domainType === CatalogueItemDomainType.VersionedFolder) {
      this.showDropTopPlaceHolder = true;
    }

    const targetElement: Element = (e.target as Element);

    // if over original node or under original parent folder
    if (parentFolder.id === currentNode.id || parentFolder.id === currentNode.parentFolder) {
      return;
    }

    // Do not allow versioned folders to be dragged and dropped into other versioned folders
    if (currentNode.domainType === CatalogueItemDomainType.VersionedFolder && parentFolder.domainType === CatalogueItemDomainType.VersionedFolder) {
      return;
    }

    if (this.droppableDomains.includes(parentFolder?.domainType)) {
      e.preventDefault();

      if (!targetElement.classList.contains('drag-over')) {
        targetElement.classList.add('drag-over');
      }
    }
  }

  dragOver(parentFolder: FlatNode, e: DragEvent) {
    if (!this.enableDragAndDrop) {
      return;
    }

    // if over original node or under original parent folder
    if (this.draggedTreeNode.id === parentFolder.id || this.draggedTreeNode.parentFolder === parentFolder.id) {
      return;
    }

    // Do not allow versioned folders to be dragged and dropped into other versioned folders
    if (this.draggedTreeNode.domainType === CatalogueItemDomainType.VersionedFolder && parentFolder.domainType === CatalogueItemDomainType.VersionedFolder) {
      return;
    }

    // make sure the drop will happen
    if (this.droppableDomains.includes(parentFolder?.domainType)) {
      e.preventDefault();
    }
  }

  dragLeave(e: DragEvent) {
    if (!this.enableDragAndDrop) {
      return;
    }

    const targetElement: Element = (e.target as Element);

    // remove highlight
    if (targetElement.classList.contains('dnd-top-placeholder')) {
      targetElement.classList.remove('drag-over-top');
    } else {
      targetElement.classList.remove('drag-over');
    }
  }

  dragEnd() {
    this.draggedTreeNode = null;
    this.showDropTopPlaceHolder = false;
  }

  async drop(parentFolder: FlatNode, e: DragEvent) {
    if (!this.enableDragAndDrop) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const currentNode: FlatNode = this.draggedTreeNode;

    if (currentNode.id === parentFolder.id || currentNode.parentFolder === parentFolder.id) {
      return;
    }

    // Do not allow versioned folders to be dragged and dropped into other versioned folders
    if (currentNode.domainType === CatalogueItemDomainType.VersionedFolder && parentFolder.domainType === CatalogueItemDomainType.VersionedFolder) {
      return;
    }

    try {
      switch (currentNode.domainType) {
        case CatalogueItemDomainType.Folder: await this.resources.folder.update(currentNode.id, { id: currentNode.id, parentFolder: parentFolder?.id }).toPromise(); break;
        case CatalogueItemDomainType.VersionedFolder: await this.resources.versionedFolder.update(currentNode.id, { id: currentNode.id, parentFolder: parentFolder?.id }).toPromise(); break;
        case CatalogueItemDomainType.DataModel: await this.resources.dataModel.moveDataModelToFolder(currentNode.id, parentFolder.id, {}).toPromise(); break;
        case CatalogueItemDomainType.CodeSet: await this.resources.codeSet.moveCodeSetToFolder(currentNode.id, parentFolder.id, {}).toPromise(); break;
        case CatalogueItemDomainType.Terminology: await this.resources.terminology.moveTerminologyToFolder(currentNode.id, parentFolder.id, {}).toPromise(); break;
        case CatalogueItemDomainType.ReferenceDataModel: await this.resources.referenceDataModel.moveReferenceDataModelToFolder(currentNode.id, parentFolder.id, {}).toPromise(); break;
        default:
          this.messageHandler.showError(`Invalid domain type: ${currentNode.domainType}`);
          return;
      }

      if (this.rememberExpandedStates) {
        const newParentPath = parentFolder ? `${this.getExpandedPaths(parentFolder)}/` : '';
        this.expandedPaths = this.expandedPaths.map((p: string) => {
          if (p.includes(currentNode.id)) {
            return `${newParentPath}${p.slice(p.indexOf(currentNode.id))}`;
          }
          return p;
        });

        localStorage.setItem('expandedPaths', JSON.stringify(this.expandedPaths));
      }

      this.messageHandler.showSuccess(`${currentNode.domainType} moved successfully.`);
      this.broadcast.reloadCatalogueTree();
    } catch (error) {
      this.messageHandler.showError(`There was a problem moving the ${currentNode.domainType}`, error);
    }

    // dragleave event did not seem to be triggered consistently on drop
    this.dragLeave(e);
  }

  dragEnterTop(e: DragEvent) {
    if (!this.enableDragAndDrop) {
      return;
    }

    const targetElement: Element = (e.target as Element);
    const isTopPlaceHolder = targetElement.classList.contains('dnd-top-placeholder');

    if (isTopPlaceHolder) {
      e.preventDefault(); // Does not seem to enable drop event

      if (!targetElement.classList.contains('drag-over-top')) {
        targetElement.classList.add('drag-over-top');
      }
    }
  }

  // This is needed to enable drop event.
  dragOverTop(e: DragEvent) {
    if (!this.enableDragAndDrop) {
      return;
    }

    const targetElement: Element = (e.target as Element);
    const isTopPlaceHolder = targetElement.classList.contains('dnd-top-placeholder');

    if (isTopPlaceHolder) {
      e.preventDefault();
    }
  }

  async dropTop(e: DragEvent) {
    if (!this.enableDragAndDrop) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const currentNode: FlatNode = this.draggedTreeNode;

    if (currentNode.domainType !== CatalogueItemDomainType.Folder && currentNode.domainType !== CatalogueItemDomainType.VersionedFolder) {
      this.messageHandler.showWarning('Only folders are allowed at the top level.');
      return;
    }

    try {
      // Top level tree node has no parent
      switch (currentNode.domainType) {
        case CatalogueItemDomainType.Folder: await this.resources.folder.update(currentNode.id, { id: currentNode.id, parentFolder: null }).toPromise(); break;
        case CatalogueItemDomainType.VersionedFolder: await this.resources.versionedFolder.update(currentNode.id, { id: currentNode.id, parentFolder: null }).toPromise(); break;
        default:
          this.messageHandler.showError(`Invalid domain type: ${currentNode.domainType}`);
          return;
      }

      if (this.rememberExpandedStates) {
        this.expandedPaths = this.expandedPaths.map((p: string) => {
          if (p.includes(currentNode.id)) {
            return p.slice(p.indexOf(currentNode.id));
          }
          return p;
        });

        localStorage.setItem('expandedPaths', JSON.stringify(this.expandedPaths));
      }

      this.messageHandler.showSuccess(`${currentNode.domainType} moved successfully.`);
      this.broadcast.reloadCatalogueTree();
    } catch (error) {
      this.messageHandler.showError(`There was a problem moving the ${currentNode.domainType}`, error);
    }

    // dragleave event did not seem to be triggered consistently on drop
    this.dragLeave(e);
  }

  // End Drag n Drop

  private getChildren = (node: MdmTreeItem) => {
    if (!node.children) {
      return [];
    }

    let children = [];
    if (this.justShowFolders && node.children) {
      children = node.children.filter(c =>
        c.domainType === CatalogueItemDomainType.Folder
        || (this.shared.features.useVersionedFolders && c.domainType === CatalogueItemDomainType.VersionedFolder));
    } else if (this.doNotShowDataClasses && node.children) {
      children = node.children.filter(c => c.domainType !== CatalogueItemDomainType.DataClass);
    } else {
      children = node.children;
    }

    if (this.filterByDomainType?.length > 0) {
      children = children.filter(c => this.filterByDomainType.includes(c.domainType));
    }

    return of(children);
  };

  private async refreshTree() {
    this.dataSource.data = this.node.children;

    if (this.rememberExpandedStates) {
      // Init extended paths
      if (!this.expandedPaths || this.expandedPaths.length === 0) {
        const storePaths = JSON.parse(localStorage.getItem('expandedPaths'));
        this.expandedPaths = storePaths ? storePaths : [];
      }
    }

    for (const expandedPath of this.expandedPaths) {
      /*
          `mat-tree` requires the ancestors to be expanded first.
          dataNodes: Flatten nodes

          Each extended path follow the pattern `<level0 node>/<level1 node>/.../<target node>.
          When the path is split, the index will correspond to the level.
      */
      const path: string[] = expandedPath.split('/');

      // Skip if parent path not in expandedPaths.
      if (!this.pathExists(path)) {
        continue;
      }

      for (let j = 0; j < path.length; j++) {
        const fnode = this.treeControl.dataNodes.find(dn => this.treeControl.getLevel(dn) === j && dn.id === path[j]);

        // Load children if they are not available
        if (this.hasChild(-1, fnode) && !fnode?.children) {
          const data = await this.expand(fnode.node);
          fnode.children = data;

          // Manually construct the FlatNodes and insert into the tree's dataNodes array
          const newNodes = fnode.children?.map((c: any) => {
            return new FlatNode(
              c,
              this.treeControl.getLevel(fnode) + 1,
              this.securityHandler.elementAccess(c));
          });

          this.treeControl.dataNodes.splice(this.treeControl.dataNodes.indexOf(fnode) + 1, 0, ...(newNodes || []));
        }
        this.treeControl.expand(fnode);
      }
    }
  }

  private pathExists(path: string[]) {
    if (path.length > 1) {
      const currentPathExists = this.expandedPaths.includes(path.join('/'));
      if (currentPathExists) {
        return this.pathExists(path.slice(0, path.length - 1));
      } else {
        // No need to go further if current path does not exists.
        return false;
      }
    } else if (path.length === 1) {
      return this.expandedPaths.includes(path[0]);
    } else {
      return false;
    }
  }

  /**
   * Construct absolute path from root to given tree node.
   */
  private getExpandedPaths(fnode: FlatNode) {
    if (this.treeControl.getLevel(fnode) > 0) {
      const index = this.treeControl.dataNodes.indexOf(fnode) - 1;
      for (let i = index; i >= 0; i--) {
        const dn = this.treeControl.dataNodes[i];
        if (this.treeControl.getLevel(dn) < this.treeControl.getLevel(fnode)) {
          return `${this.getExpandedPaths(dn)}/${fnode.id}`;
        }
      }
    } else {
      return fnode.id;
    }
  }
}
