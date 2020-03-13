import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { MatMenuTrigger } from '@angular/material/menu';
import { of, Subscription } from 'rxjs';
import { ResourcesService } from '../services/resources.service';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MessageService } from '../services/message.service';
import { FavouriteHandlerService } from '../services/handlers/favourite-handler.service';
import { FolderService } from './folder.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { HttpResponse } from '@angular/common/http';
import { DOMAIN_TYPE, FlatNode, Node } from './flat-node';

@Component({
  selector: 'mdm-folders-tree',
  templateUrl: './folders-tree.component.html',
  styleUrls: ['./folders-tree.component.scss']
})
export class FoldersTreeComponent implements OnInit, OnChanges, OnDestroy {

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

  @Input() treeName = 'unnamed';

  @Input() inSearchMode: any;

  @ViewChild(MatMenuTrigger, { static: false }) contextMenuTrigger: MatMenuTrigger;
  contextMenuPosition = { x: '0', y: '0' };

  favourites: { [x: string]: any; };
  subscriptions: Subscription = new Subscription();
  selectedNode = null; // Control highlighting
  checkedList = this.defaultCheckedMap || {};

  targetVersions = [];
  expandedPaths = [];

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  protected treeFlattener: MatTreeFlattener<Node, FlatNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<Node, FlatNode>;

  /**
   * Get the children for the given node from source data.
   *
   * Defined as property to retain reference to `this`.
   */
  private getChildren = (node: Node) => {
    if (!node.children) {
      return [];
    }

    let children = [];
    if (this.justShowFolders) {
      children = node.children.filter(c => c.domainType === DOMAIN_TYPE.Folder);
    } else if (this.doNotShowDataClasses) {
      children = node.children.filter(c => c.domainType !== DOMAIN_TYPE.DataClass);
    } else {
      children = node.children;
    }

    return of(children);
  };

  constructor(
    protected messages: MessageService,
    protected resources: ResourcesService,
    protected securityHandler: SecurityHandlerService,
    protected favouriteHandler: FavouriteHandlerService,
    protected folderService: FolderService,
    protected stateHandler: StateHandlerService,
    protected messageHandler: MessageHandlerService
  ) {
    this.loadFavourites();
    this.subscriptions.add(this.messages.on('favoutires', () => {
      this.loadFavourites();
    }));

    this.treeFlattener = new MatTreeFlattener(
      (node: Node, level: number) => new FlatNode(node, level),
      (node: FlatNode) => node.level,
      (node: FlatNode) => node.hasChildren || node.hasChildFolders, this.getChildren);

    this.treeControl = new FlatTreeControl(
      (node: FlatNode) => node.level,
      (node: FlatNode) => node.hasChildren || node.hasChildFolders);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener, []);
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.node) {
      if (this.node && this.node.children) {
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
    if (node.domainType === DOMAIN_TYPE.DataModel && this.doNotShowDataClasses) {
      return false;
    }

    return node?.hasChildren || node?.hasChildFolders;
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
    return `fa-lg ${node.deleted ? 'deleted-folder' : 'themeColor'}`;
  }

  private async refreshTree() {
    this.dataSource.data = this.node.children;

    if (this.rememberExpandedStates) {
      // Init extended paths
      if (!this.expandedPaths || this.expandedPaths.length === 0) {
        const storePaths = JSON.parse(sessionStorage.getItem('expandedPaths'));
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
        if (fnode?.hasChildren && !fnode?.children) {
          const data = await this.expand(fnode.node);
          fnode.children = data.body;

          // Manually construct the FlatNodes and insert into the tree's dataNodes array
          const newNodes = fnode.children.map((c: any) => {
            return new FlatNode(c, this.treeControl.getLevel(fnode) + 1);
          });

          this.treeControl.dataNodes.splice(this.treeControl.dataNodes.indexOf(fnode) + 1, 0, ...newNodes);
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
      sessionStorage.setItem('expandedPaths', JSON.stringify(this.expandedPaths));
    }

    if (!this.inSearchMode && !flatNode.children) {
      const data = await this.expand(flatNode.node);
      flatNode.children = data.body;
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
    try {
      switch (node.domainType) {
        case DOMAIN_TYPE.Folder:
          if (this.justShowFolders) {
            return await this.resources.tree.get(node.id, null, { foldersOnly: true }).toPromise();
          } else {
            return node.children;
          }
        case DOMAIN_TYPE.DataModel:
        case DOMAIN_TYPE.DataClass:
          return await this.resources.tree.get(node.id).toPromise();
        case DOMAIN_TYPE.Terminology:
          return await this.resources.terminology.get(node.id, 'tree').toPromise();
        case DOMAIN_TYPE.Term:
          return await this.resources.term.get(node.terminology, node.id, 'tree').toPromise();
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
    const element = this.find(this.node, null, child.id);

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
    if (node.domainType === DOMAIN_TYPE.Folder || node.domainType === DOMAIN_TYPE.DataModel || node.domainType === DOMAIN_TYPE.DataClass || node.isRoot === true) {
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

    if (!this.enableContextMenu) {
      return;
    }

    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
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

  async handleAddFolder(fnode: FlatNode) {
    if (this.selectedNode) {
      this.selectedNode.selected = false;
    }

    try {
      let result: HttpResponse<Node>;
      let newNode: FlatNode;
      if (!fnode) {
        // Create new top level folder
        result = await this.resources.folder.post(null, null, { resource: {} }).toPromise();
        result.body.domainType = DOMAIN_TYPE.Folder;
        this.node.children.push(result.body);

        newNode = new FlatNode(result.body, 0);
        this.treeControl.dataNodes.push(newNode);
      } else {
        // Add new folder to existing folder
        result = await this.resources.folder.post(fnode.id, 'folders', { resource: {} }).toPromise();
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

      this.stateHandler.Go('Folder', { id: result.body.id, edit: true });

      this.messageHandler.showSuccess('Folder created successfully.');

    } catch (error) {
      console.log(error);
      this.messageHandler.showError('There was a problem creating the Folder.', error);
    }
  }

  async handleAddDataModel(fnode: FlatNode) {
    this.stateHandler.Go('NewDataModel', { parentFolderId: fnode.id });
  }

  async handleAddCodeSet(fnode: FlatNode) {
    this.stateHandler.Go('NewCodeSet', { parentFolderId: fnode.id });
  }

  async handleDeleteFolder(fnode: FlatNode, permanent = false) {
    this.deleteFolderEvent.emit({ folder: fnode, permanent });
    if (!permanent) {
      fnode.deleted = true;
    }
  }

  async handleAddDataClass(fnode: FlatNode) {
    this.stateHandler.Go('NewDataClass', {
      grandParentDataClassId: fnode.domainType === DOMAIN_TYPE.DataClass ? fnode.parentDataClass : null,
      parentDataModelId: fnode.domainType === DOMAIN_TYPE.DataModel ? fnode.id : fnode.dataModel,
      parentDataClassId: fnode.domainType === DOMAIN_TYPE.DataModel ? null : fnode.id
    });
  }

  async handleAddDataElement(fnode: FlatNode) {
    this.stateHandler.Go('NewDataElement', {
      grandParentDataClassId: fnode.parentDataClass ? fnode.parentDataClass : null,
      parentDataModelId: fnode.dataModel,
      parentDataClassId: fnode.id
    });
  }

  async handleAddDataType(fnode: FlatNode) {
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
      let str = (ftd.label as string);
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
}

