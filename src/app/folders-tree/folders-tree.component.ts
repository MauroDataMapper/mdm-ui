/*
Copyright 2020 University of Oxford

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
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { of, Subscription } from 'rxjs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { DOMAIN_TYPE, FlatNode, Node } from './flat-node';
import { MatDialog } from '@angular/material/dialog';
import { FolderService } from './folder.service';
import { NewFolderModalComponent } from '@mdm/modals/new-folder-modal/new-folder-modal.component';
import { MessageService, SecurityHandlerService, FavouriteHandlerService, StateHandlerService, BroadcastService } from '@mdm/services';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'mdm-folders-tree',
  templateUrl: './folders-tree.component.html',
  styleUrls: ['./folders-tree.component.scss']
})
export class FoldersTreeComponent implements OnChanges, OnDestroy {

  @Input() node: any;
  @Input() searchCriteria: string;
  @Input() defaultCheckedMap: any;

  @Output() nodeClickEvent = new EventEmitter<any>();
  @Output() nodeDbClickEvent = new EventEmitter<any>();
  @Output() nodeCheckedEvent = new EventEmitter<any>();

  @Output() addFolderEvent = new EventEmitter<any>();
  @Output() addCodeSetEvent = new EventEmitter<any>();
  @Output() addDataModelEvent = new EventEmitter<any>();
  @Output() addChildDataClassEvent = new EventEmitter<any>();
  @Output() addChildDataTypeEvent = new EventEmitter<any>();
  @Output() addChildDataElementEvent = new EventEmitter<any>();
  @Output() deleteFolderEvent = new EventEmitter<any>();

  @Output() compareToEvent = new EventEmitter<any>();
  @Output() loadModelsToCompareEvent = new EventEmitter<any>();

  @Input() doNotShowDataClasses: any;
  @Input() doNotShowTerms: any;
  @Input() justShowFolders: any;
  @Input() showCheckboxFor: any; // it is an array of domainTypes like ['DataClass';'DataModel';'Folder']
  @Input() propagateCheckbox: any;
  @Input() enableDrag: any;
  @Input() enableDrop: any;
  @Input() enableContextMenu = false;
  @Input() rememberExpandedStates = false;
  @Input() expandOnNodeClickFor: any;
  @Input() doNotMakeSelectedBold: any;
  @Input() filterByDomainType: DOMAIN_TYPE[];

  @Input() treeName = 'unnamed';

  @Input() inSearchMode: any;

  @Input() initialExpandedPaths: string[];
  @Input() isComparisonTree = false;

  @ViewChild(MatMenuTrigger, { static: false }) contextMenuTrigger: MatMenuTrigger;
  contextMenuPosition = { x: '0', y: '0' };

  favourites: { [x: string]: any };
  subscriptions: Subscription = new Subscription();
  selectedNode = null; // Control highlighting
  checkedList = this.defaultCheckedMap || {};

  targetVersions = [];
  expandedPaths = [];

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<Node, FlatNode>;

  folder = '';

  expandedNodeSet = new Set<string>();

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  protected treeFlattener: MatTreeFlattener<Node, FlatNode>;

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
    private broadcastSvc: BroadcastService,
    public dialog: MatDialog
  ) {
    this.loadFavourites();
    this.subscriptions.add(this.messages.on('favourites', () => {
      this.loadFavourites();
    }));

    this.treeFlattener = new MatTreeFlattener(
      (node: Node, level: number) => new FlatNode(node, level),
      (node: FlatNode) => node.level,
      (node: FlatNode) => node?.hasChildren || node?.hasChildFolders,
      this.getChildren);

    this.treeControl = new FlatTreeControl((node: FlatNode) => node.level, (node: FlatNode) => node.hasChildren || node.hasChildFolders);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener, []);
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

    // HACK TO FILTER CLASSIFERS NEEDS REVISITED
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
  hasChild(index: number, node: FlatNode) {
    if (node?.domainType === DOMAIN_TYPE.DataModel && this.doNotShowDataClasses) {
      return false;
    }

    if (this.expandOnNodeClickFor && !this.expandOnNodeClickFor?.includes(node?.domainType)) {
      return false;
    }

    return node?.hasChildFolders || node?.hasChildren;
  }

  /** Determine which tree node icon to use based on given node's domain type */
  getIcon(fnode: FlatNode) {
    switch (fnode.domainType) {
      case DOMAIN_TYPE.Folder:
        return this.treeControl.isExpanded(fnode) ? 'fa-folder-open' : 'fa-folder';
      case DOMAIN_TYPE.DataModel:
        if (fnode.type === 'Data Standard') {
          return 'fa-file-alt';
        } else if (fnode.type === 'Data Asset') {
          return 'fa-database';
        }
        break;
      case DOMAIN_TYPE.Terminology:
        return 'fa-book';
      case DOMAIN_TYPE.CodeSet:
        return 'fa-list';
      case DOMAIN_TYPE.Classification:
        return 'fa-tags';
      case DOMAIN_TYPE.Term:
        return 'fa-code';  // Not currently used in html template
      default:
        return null;
    }
  }

  /** Additional CSS classes to add to the tree node. fa-lg is requied to make sure fa icon is properly sized. */
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
    this.selectedNode = fnode; // Control highlighting selected tree node
    this.nodeClickEvent.emit(fnode.node);
  }

  handleDbClick(fnode: FlatNode) {
    this.selectedNode = fnode; // Control highlighting selected tree node
    this.nodeDbClickEvent.emit(fnode.node);
  }

  async expand(node: Node) {
    let dataModelResponse;
    let dataClassResponse;
    let terminologyResponse;
    let termResponse;
    try {
      switch (node.domainType) {
        case DOMAIN_TYPE.Folder:
          if (this.justShowFolders) {
            const folderResponse = await this.resources.tree.get('folders', 'folders', node.id).toPromise();
            return folderResponse.body;
          } else {
            return node.children;
          }
        case DOMAIN_TYPE.DataModel:
          dataModelResponse = await this.resources.tree.get('folders', 'dataModels', node.id).toPromise();
          return dataModelResponse.body;
        case DOMAIN_TYPE.DataClass:
          dataClassResponse = await this.resources.tree.get('folders', 'dataClasses', node.id).toPromise();
          return dataClassResponse.body;
        case DOMAIN_TYPE.Terminology:
          terminologyResponse = await this.resources.tree.get('folders', 'terminologies', node.id).toPromise();
          return terminologyResponse.body;
        case DOMAIN_TYPE.Term:
          termResponse = await this.resources.tree.get('folders', 'terms', node.id).toPromise();
          return termResponse.body;
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

    this.markChildren(child, child, child.checked);

    if (child.checked) {
      this.checkedList[element.node.id] = element;
    } else {
      delete this.checkedList[element.node.id];
    }

    this.nodeCheckedEvent.emit([child, child.parentDataClass, this.checkedList]);
  }

  find(node: Node, parent: Node, id: string) {
    if (node.id === id) {
      return { node, parent };
    }
    if (node.domainType === DOMAIN_TYPE.Terminology || node.domainType === DOMAIN_TYPE.Folder || node.domainType === DOMAIN_TYPE.DataModel || node.domainType === DOMAIN_TYPE.DataClass || node.isRoot === true) {
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

  markChildren(node: FlatNode, root: FlatNode, status: boolean) {
    node.checked = status;
    delete this.checkedList[node.id];

    if (this.propagateCheckbox) {
      node.children?.forEach((n: FlatNode) => {
        n.disableChecked = status;
        this.markChildren(n, null, status);
      });
    }
  }

  /** Context Menu */
  async onContextMenu(fnode: FlatNode, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.enableContextMenu || fnode.domainType === DOMAIN_TYPE.Term) {
      return;
    }

    this.contextMenuPosition.x = `${event.clientX}px`;
    this.contextMenuPosition.y = `${event.clientY}px`;
    this.contextMenuTrigger.menuData = { node: fnode };
    this.contextMenuTrigger.openMenu();

    if (fnode.domainType === DOMAIN_TYPE.DataModel) {
      this.targetVersions = await this.folderService.loadVersions(fnode.node);
    }
  }

  handleFavourites(fnode: FlatNode) {
    this.favouriteHandler.toggle(fnode.node);
    this.loadFavourites();
  }

  handleAddFolderModal = (fnode: FlatNode) => {
    const promise = new Promise(() => {
      const dialog = this.dialog.open(NewFolderModalComponent, {
        data: {
          inputValue: this.folder,
          modalTitle: 'Create a new Folder',
          okBtn: 'Add folder',
          btnType: 'primary',
          inputLabel: 'Folder name',
          message: 'Please enter the name of your Folder.'
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result) {
          if (this.validateLabel(result)) {
            this.folder = result;
            this.handleAddFolder(fnode, this.folder);
          } else {
            const error = 'err';
            this.messageHandler.showError('Data Model name can not be empty', error);
            return;
          }
        } else {
          return;
        }
      });
    });
    return promise;
  };

  async handleAddFolder(fnode: FlatNode, label?: string) {
    if (this.selectedNode) {
      this.selectedNode.selected = false;
    }
    try {
      let result: HttpResponse<Node>;
      let newNode: FlatNode;
      if (!fnode) {
        // Create new top level folder
        result = await this.resources.folder.save(label).toPromise();
        result.body.domainType = DOMAIN_TYPE.Folder;
        this.node.children.push(result.body);

        newNode = new FlatNode(result.body, 0);
        this.treeControl.dataNodes.push(newNode);
      } else {
        // Add new folder to existing folder
        result = await this.resources.folder.saveChildrenOf(fnode.id, label).toPromise();
        result.body.domainType = DOMAIN_TYPE.Folder;
        if (!fnode.children) {
          fnode.children = [];
        }
        fnode.children.push(result.body);
        newNode = new FlatNode(result.body, this.treeControl.getLevel(fnode) + 1);
        this.treeControl.dataNodes.splice(this.treeControl.dataNodes.indexOf(fnode) + 1, 0, newNode);
      }
      fnode.node.hasChildren = true;

      this.treeControl.expand(fnode);

      this.selectedNode = this.treeControl.dataNodes.find(dn => dn.id === newNode.id && this.treeControl.getLevel(dn) === newNode.level);

      this.stateHandler.Go('Folder', { id: result.body.id, edit: false });

      this.messageHandler.showSuccess('Folder created successfully.');
      this.folder = '';
      this.refreshTree();

    } catch (error) {
      this.messageHandler.showError('There was a problem creating the Folder.', error);
    }
  }

  handleAddDataModel(fnode: FlatNode) {
    this.stateHandler.Go('NewDataModel', { parentFolderId: fnode.id });
  }

  handleAddCodeSet(fnode: FlatNode) {
    this.stateHandler.Go('NewCodeSet', { parentFolderId: fnode.id });
  }

  handleDeleteFolder(fnode: FlatNode, permanent = false) {
    this.deleteFolderEvent.emit({ folder: fnode, permanent });
  }

  handleAddDataClass(fnode: FlatNode) {
    this.stateHandler.Go('NewDataClass', {
      grandParentDataClassId: fnode.domainType === DOMAIN_TYPE.DataClass ? fnode.node.parentId : null,
      parentDataModelId: fnode.domainType === DOMAIN_TYPE.DataModel ? fnode.id : fnode.node.modelId,
      parentDataClassId: fnode.domainType === DOMAIN_TYPE.DataModel ? null : fnode.id
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

  openWindow(fnode: FlatNode) {
    switch (fnode.domainType) {
      case DOMAIN_TYPE.DataModel: this.stateHandler.NewWindow(DOMAIN_TYPE.DataModel.toLocaleLowerCase(), { id: fnode.id }); break;
      case DOMAIN_TYPE.DataClass: this.stateHandler.NewWindow(DOMAIN_TYPE.DataClass.toLocaleLowerCase(), { id: fnode.id, dataModelId: fnode.dataModel, dataClassId: fnode.parentDataClass }); break;
      case DOMAIN_TYPE.Terminology: this.stateHandler.NewWindow(DOMAIN_TYPE.Terminology.toLocaleLowerCase(), { id: fnode.id }); break;
    }
  }

  isFavourited(fnode: FlatNode) {
    return this.favouriteHandler.isAdded(fnode);
  }

  get isUserAdmin() {
    return this.securityHandler.isAdmin();
  }

  isNodeFinalised(node: FlatNode) {
    if (node.finalised) {
      return node.finalised;
    } else if (node.dataModel) {
      const dm = this.treeControl.dataNodes.find(fnode => fnode.id === node.dataModel);
      return dm?.finalised;
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Only used for Classifiers
  filter(filterText: string, sourceNodes: Node[] = this.node.children) {
    if (!filterText) {
      return;
    }
    const filteredTreeData: Node[] = sourceNodes.filter(d => d.label.toLocaleLowerCase().includes(filterText.toLocaleLowerCase()));

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

  visibleNodes(): FlatNode[] {
    this.rememberExpandedTreeNodes(this.treeControl, this.expandedNodeSet);
    const result = [];

    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function addExpandedChildren(node, expanded: Set<string>) {
      result.push(node);
      if (expanded.has(node.id)) {
        node.children.map(child => addExpandedChildren(child, expanded));
      }
    }
    this.dataSource.data.forEach(node => {
      addExpandedChildren(node, this.expandedNodeSet);
    });
    return result;
  }

  async drop(event: CdkDragDrop<string[]>) {
    // ignore drops outside of the tree
    if (!event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.visibleNodes();

    // deep clone the data source so we can mutate it
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data));

    // recursive find function to find siblings of node
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function findNodeSiblings(arr: Array<any>, id: string): Array<any> {
      let result;
      let subResult;
      arr.forEach(item => {
        if (item.id === id) {
          result = arr;
        } else if (item.children) {
          subResult = findNodeSiblings(item.children, id);
          if (subResult) result = subResult;
        }
      });
      return result;
    }

    // remove the node from its old place
    const node = event.item.data;
    const domain = node.node.domainType;
    const siblings = findNodeSiblings(changedData, node.id);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    const nodeToInsert = siblings.splice(siblingIndex, 1)[0];

    // determine where to insert the node
    const nodeAtDest = visibleNodes[event.currentIndex];
    if (nodeAtDest.id === nodeToInsert.id) return;

    const nodeAtDestFlatNode = this.treeControl.dataNodes.find(n => nodeAtDest.id === n.id);
    const parent = this.getParentNode(nodeAtDestFlatNode);
    const draggableModels = ['DataModel', 'Terminology', 'CodeSet', 'ReferenceDataModel'];

    // if we are moving a Folder
    // check if the 'source'/item that is being dragged is a Folder
    if (domain === 'Folder') {
      console.log(parent);
      const parentFolder = parent ? parent.id : null;
      await this.resources.folder.update(node.id, { parentFolder }).subscribe(() => {
        this.messageHandler.showSuccess('Folder moved successfully.');
        this.broadcastSvc.broadcast('$reloadFoldersTree');
      }, error => {
        this.messageHandler.showError('There was a problem moving the Folder.', error);
      });
    }
    // check if the 'source'/item that is being dragged is a DataModel, Terminology, etc
    else if (draggableModels.includes(domain)) {
      const modelId = node.id;
      const destinationFolder = nodeAtDestFlatNode.id;
      console.log(nodeAtDestFlatNode);

      // check if the destination item is a Folder
      if(nodeAtDestFlatNode.node.domainType === 'Folder') {
        let endpoint;
        if (domain === 'DataModel') {
          endpoint = this.resources.dataModel.moveDataModelToFolder(modelId, destinationFolder, {});
        } else if (domain === 'CodeSet') {
          endpoint = this.resources.codeSet.moveCodeSetToFolder(modelId, destinationFolder, {});
        } else if (domain === 'Terminology') {
          endpoint = this.resources.terminology.moveTerminologyToFolder(modelId, destinationFolder, {});
        } else if (domain === 'ReferenceDataModel') {
          endpoint = this.resources.referenceDataModel.moveReferenceDataModelToFolder(modelId, destinationFolder, {});
        }

        endpoint.subscribe(() => {
          this.messageHandler.showSuccess(`${domain} moved successfully.`);
          this.broadcastSvc.broadcast('$reloadFoldersTree');
        }, error => {
          this.messageHandler.showError(`There was a problem moving the ${domain}`, error);
        });
      }

    }
  }

  private rememberExpandedTreeNodes(treeControl: FlatTreeControl<FlatNode>, expandedNodeSet: Set<string>) {
    if (treeControl.dataNodes) {
      treeControl.dataNodes.forEach((node) => {
        if (treeControl.isExpandable(node) && treeControl.isExpanded(node)) {
          // capture latest expanded state
          expandedNodeSet.add(node.id);
        }
      });
    }
  }

  private getParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  private getChildren = (node: Node) => {
    if (!node.children) {
      return [];
    }

    let children = [];
    if (this.justShowFolders && node.children) {
      children = node.children.filter(c => c.domainType === DOMAIN_TYPE.Folder);
    } else if (this.doNotShowDataClasses && node.children) {
      children = node.children.filter(c => c.domainType !== DOMAIN_TYPE.DataClass);
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
          `mat-tree` requires the ancesters to be expanded first.
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
            return new FlatNode(c, this.treeControl.getLevel(fnode) + 1);
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

