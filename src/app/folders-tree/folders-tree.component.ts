import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { of, Subscription } from 'rxjs';
import { ResourcesService } from '../services/resources.service';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MessageService } from '../services/message.service';
import { FavouriteHandlerService } from '../services/handlers/favourite-handler.service';
import { FolderService } from './folder.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: "folders-tree-3",
  templateUrl: './folders-tree.component.html',
  styleUrls: ['./folders-tree.component.scss']
})
export class FoldersTreeComponent implements OnInit, OnChanges, OnDestroy {

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
    this.subscriptions.add(
      this.messages.on("favoutires", () => {
        this.loadFavourites();
      })
    );

    this.treeFlattener = new MatTreeFlattener(
      (node: Node, level: number) => new FlatNode(node, level),
      (node: FlatNode) => node.level,
      (node: FlatNode) => node.hasChildren,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl(
      (node: FlatNode) => node.level,
      (node: FlatNode) => node.hasChildren
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener,
      []
    );
  }

  get isUserAdmin() {
    return this.securityHandler.isAdmin();
  }

  @Input() node;
  @Input() searchCriteria;
  @Input() defaultCheckedMap;

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

  @Input() doNotShowDataClasses;
  @Input() doNotShowTerms;
  @Input() justShowFolders;
  @Input() showCheckboxFor; //it is an array of domainTypes like ['DataClass';'DataModel';'Folder']
  @Input() propagateCheckbox;
  @Input() enableDrag;
  @Input() enableDrop;
  @Input() enableContextMenu = false;
  @Input() rememberExpandedStates = false;
  @Input() expandOnNodeClickFor;
  @Input() doNotMakeSelectedBold;

  @Input() treeName = "unnamed";

  @Input() inSearchMode;

  @ViewChild(MatMenuTrigger, { static: false })
  contextMenuTrigger: MatMenuTrigger;
  contextMenuPosition = { x: "0", y: "0" };

  favourites;
  subscriptions: Subscription = new Subscription();
  selectedNode = null; //Control highlighting
  checkedList = this.defaultCheckedMap || {};

  targetVersions = [];
  expandedPaths = [];

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  private treeFlattener: MatTreeFlattener<Node, FlatNode>;

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
      children = node.children.filter(c => c.domainType === "Folder");
    } else if (this.doNotShowDataClasses) {
      children = node.children.filter(c => c.domainType !== "DataClass");
    } else {
      children = node.children;
    }

    return of(children);
  };

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.node) {
      if (this.node && this.node.children) {
        this.refreshTree();
      }
    }

    //HACK TO FILTER CLASSIFERS NEEDS REVISITED
    //Note 1: The domain model tree uses backend API call to get filtered results.
    if (changes.searchCriteria) {
      if (
        this.treeName &&
        this.treeName === "Classifiers" &&
        this.searchCriteria &&
        this.searchCriteria.trim().length > 0
      ) {
        this.filter(this.searchCriteria);
      }
    }
  }

  loadFavourites() {
    let fs: any[] = this.favouriteHandler.get();
    this.favourites = {};
    fs.forEach(f => {
      this.favourites[f.id] = f;
    });
  }

  /** Get whether the node has children or not. Tree branch control. */
  hasChild(index: number, node: FlatNode) {
    if (node.domainType === "DataModel" && this.doNotShowDataClasses) {
      return false;
    }
    return node?.hasChildren;
  }

  /** Determine which tree node icon to use based on given node's domain type */
  getIcon(fnode: FlatNode) {
    switch (fnode.domainType) {
      case "Folder":
        return this.treeControl.isExpanded(fnode)
          ? "fa-folder-open"
          : "fa-folder";
      case "DataModel":
        if (fnode.type === "Data Standard") {
          return "fa-file-text-o";
        } else if (fnode.type === "Data Asset") {
          return "fa-database";
        }
      case "Terminology":
        return "fa-book";
      case "CodeSet":
        return "fa-list";
      case "Classification":
        return "fa-tags";
      case "Term":
        return "fa-code"; //Not currently used in html template
      default:
        return null;
    }
  }

  /** Additional CSS classes to add to the tree node. fa-lg is requied to make sure fa icon is properly sized. */
  getCssClass(node: FlatNode) {
    return `fa-lg ${node.deleted ? "deleted-folder" : "themeColor"}`;
  }

  private async refreshTree() {
    this.dataSource.data = this.node.children;

    if (this.rememberExpandedStates) {
      // Init extended paths
      if (!this.expandedPaths || this.expandedPaths.length === 0) {
        let storePaths = JSON.parse(sessionStorage.getItem("expandedPaths"));
        this.expandedPaths = storePaths ? storePaths : [];
      }
    }

    for (let i = 0; i < this.expandedPaths.length; i++) {
      /* 
                `mat-tree` requires the ancesters to be expanded first.
                dataNodes: Flatten nodes
                
                Each extended path follow the pattern `<level0 node>/<level1 node>/.../<target node>.
                When the path is split, the index will correspond to the level. 
            */
      let path: string[] = this.expandedPaths[i].split("/");

      // Skip if parent path not in expandedPaths.
      if (!this.pathExists(path)) {
        continue;
      }

      for (let j = 0; j < path.length; j++) {
        let fnode = this.treeControl.dataNodes.find(
          dn => this.treeControl.getLevel(dn) === j && dn.id === path[j]
        );

        // Load children if they are not available
        if (fnode?.hasChildren && !fnode?.children) {
          let data = await this.expand(fnode.node);
          fnode.children = data.body;

          // Manually construct the FlatNodes and insert into the tree's dataNodes array
          let newNodes = fnode.children.map(c => {
            return new FlatNode(c, this.treeControl.getLevel(fnode) + 1);
          });

          this.treeControl.dataNodes.splice(
            this.treeControl.dataNodes.indexOf(fnode) + 1,
            0,
            ...newNodes
          );
        }

        for (let j = 0; j < path.length; j++) {
          let fnode = this.treeControl.dataNodes.find(
            dn => this.treeControl.getLevel(dn) === j && dn.id === path[j]
          );

          // Load children if they are not available
          if (fnode?.hasChildren && !fnode?.children) {
            let data = await this.expand(fnode.node);
            fnode.children = data.body;

            // Manually construct the FlatNodes and insert into the tree's dataNodes array
            let newNodes = fnode.children.map(c => {
              return new FlatNode(c, this.treeControl.getLevel(fnode) + 1);
            });

            this.treeControl.dataNodes.splice(
              this.treeControl.dataNodes.indexOf(fnode) + 1,
              0,
              ...newNodes
            );
          }
          this.treeControl.expand(fnode);
        }
      }
    }
  }

  private pathExists(path: string[]) {
    if (path.length > 1) {
      let currentPathExists = this.expandedPaths.includes(path.join("/"));
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
      let index = this.treeControl.dataNodes.indexOf(fnode) - 1;
      for (let i = index; i >= 0; i--) {
        let dn = this.treeControl.dataNodes[i];
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
        this.expandedPaths.splice(
          this.expandedPaths.indexOf(this.getExpandedPaths(flatNode)),
          1
        );
        this.expandedPaths.sort();
      }
    }

    if (this.rememberExpandedStates) {
      sessionStorage.setItem(
        "expandedPaths",
        JSON.stringify(this.expandedPaths)
      );
    }

    if (!this.inSearchMode && !flatNode.children) {
      let data = await this.expand(flatNode.node);
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
        case "Folder":
          // if (this.justShowFolders){
          //     return await this.resources.folder.get(node.id, 'folders').toPromise();;
          // } else {
          return node.children;
        // }
        case "DataModel":
        case "DataClass":
          return await this.resources.tree.get(node.id).toPromise();
        case "Terminology":
          return await this.resources.terminology
            .get(node.id, "tree")
            .toPromise();
        case "Term":
          return await this.resources.term
            .get(node.terminology, node.id, "tree")
            .toPromise();
        default:
          return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  noop(event) {
    event.preventDefault();
  }

  nodeChecked(child) {
    var element = this.find(this.node, null, child.id);

    this.markChildren(child, child, child.checked);

    if (child.checked) {
      this.checkedList[element.node.id] = element;
    } else {
      delete this.checkedList[element.node.id];
    }

    this.nodeCheckedEvent.emit([child,child.parent,this.checkedList]);
  }

  find(node, parent, ID) {
    if (node.id === ID) {
      return { node: node, parent: parent };
    }
    if (
      node.domainType === "Folder" ||
      node.domainType === "DataModel" ||
      node.domainType === "DataClass" ||
      node.isRoot === true
    ) {
      if (!node.children) {
        return null;
      }
      var i = 0;
      while (i < node.children.length) {
        var result = this.find(node.children[i], node, ID);
        if (result !== null) {
          return result;
        }
        i++;
      }
    }
    return null;
  }

  markChildren(node, root, status) {
    node.checked = status;
    delete this.checkedList[node.id];

    if (this.propagateCheckbox) {
      if (node.children) {
        node.children.forEach(n => {
          n.disableChecked = status;
          this.markChildren(n, null, status);
        });
      }
    }
  }

  //** Context Menu */

  async onContextMenu(fnode: FlatNode, event) {
    event.preventDefault();

    if (!this.enableContextMenu) {
      return;
    }

    this.contextMenuPosition.x = event.clientX + "px";
    this.contextMenuPosition.y = event.clientY + "px";
    this.contextMenuTrigger.menuData = { node: fnode };
    this.contextMenuTrigger.openMenu();

    if (fnode.domainType === "DataModel") {
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
      let result;
      let newNode;
      if (!fnode) {
        //Create new top level folder
        result = await this.resources.folder
          .post(null, null, { resource: {} })
          .toPromise();
        result.body.domainType = "Folder";
        this.node.children.push(result.body);

        newNode = new FlatNode(result.body, 0);
        this.treeControl.dataNodes.push(newNode);
      } else {
        //Add new folder to existing folder
        result = await this.resources.folder
          .post(fnode.id, "folders", { resource: {} })
          .toPromise();
        result.body.domainType = "Folder";
        if (!fnode.children) {
          fnode.children = [];
        }
        fnode.children.push(result.body);
        newNode = new FlatNode(
          result.body,
          this.treeControl.getLevel(fnode) + 1
        );
        this.treeControl.dataNodes.splice(
          this.treeControl.dataNodes.indexOf(fnode) + 1,
          0,
          newNode
        );
      }
      fnode.node.hasChildren = true;

      this.treeControl.expand(fnode);

      this.selectedNode = this.treeControl.dataNodes.find(
        dn =>
          dn.id === newNode.id &&
          this.treeControl.getLevel(dn) === newNode.level
      );

      this.stateHandler.Go("Folder", { id: result.body.id, edit: true });

      this.messageHandler.showSuccess("Folder created successfully.");
    } catch (error) {
      console.log(error);
      this.messageHandler.showError(
        "There was a problem creating the Folder.",
        error
      );
    }
  }

  async handleAddDataModel(fnode: FlatNode) {
    this.stateHandler.Go("NewDataModel", { parentFolderId: fnode.id });
  }

  async handleAddCodeSet(fnode: FlatNode) {
    this.stateHandler.Go("NewCodeSet", { parentFolderId: fnode.id });
  }

  async handleDeleteFolder(fnode: FlatNode, permanent = false) {
    this.deleteFolderEvent.emit({ folder: fnode, permanent: permanent });
    if (!permanent) {
      fnode.deleted = true;
    }
  }

  async handleAddDataClass(fnode: FlatNode) {
    this.stateHandler.Go("NewDataClass", {
      grandParentDataClassId:
        fnode.domainType === "DataClass" ? fnode.parentDataClass : null,
      parentDataModelId:
        fnode.domainType === "DataModel" ? fnode.id : fnode.dataModel,
      parentDataClassId: fnode.domainType === "DataModel" ? null : fnode.id
    });
  }

  async handleAddDataElement(fnode: FlatNode) {
    this.stateHandler.Go("NewDataElement", {
      grandParentDataClassId: fnode.parentDataClass
        ? fnode.parentDataClass
        : null,
      parentDataModelId: fnode.dataModel,
      parentDataClassId: fnode.id
    });
  }

  async handleAddDataType(fnode: FlatNode) {
    this.stateHandler.Go("NewDataType", { parentDataModelId: fnode.id });
  }

  handleDataModelCompare(fnode: FlatNode, targetVersion = null) {
    this.stateHandler.NewWindow("modelscomparison", {
      sourceId: fnode.id,
      targetId: targetVersion ? targetVersion.id : null
    });
  }

  openWindow(fnode: FlatNode) {
    switch (fnode.domainType) {
      case "DataModel":
        this.stateHandler.NewWindow("datamodel", { id: fnode.id });
        break;
      case "DataClass":
        this.stateHandler.NewWindow("dataclass", {
          id: fnode.id,
          dataModelId: fnode.dataModel,
          dataClassId: fnode.parentDataClass
        });
        break;
      case "Terminology":
        this.stateHandler.NewWindow("terminology", { id: fnode.id });
        break;
    }
  }

  isFavourited(fnode: FlatNode) {
    return this.favouriteHandler.isAdded(fnode);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Only used for Classifiers
  filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      filteredTreeData = this.dataSource.data.filter(
        d =>
          d.label.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) >
          -1
      );
      Object.assign([], filteredTreeData).forEach(ftd => {
        let str = <string>ftd.label;
        while (str.lastIndexOf(".") > -1) {
          const index = str.lastIndexOf(".");
          str = str.substring(0, index);
          if (filteredTreeData.findIndex(t => t.code === str) === -1) {
            const obj = this.dataSource.data.find(d => d.label === str);
            if (obj) {
              filteredTreeData.push(obj);
            }
          }
        }
      });
    } else {
      filteredTreeData = this.dataSource.data;
    }

    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    // file node as children.
    this.node.children = filteredTreeData;
    this.refreshTree();
  }
}

/** (Partial) Structure of source node */
export interface Node {
  children?: Node[];
  deleted?: boolean;
  finalised?: boolean;
  domainType: string;
  type?: string;
  terminology?: any;
  hasChildren: boolean;
  id: string;
  label?: string;
  open: boolean;
  parentFolder?: string;
}

/** Wrapper for source node to support Material Flat Tree */
export class FlatNode {
  constructor(public node: any, public level: number) {}

  /**
   * Getter and Setter passthrough to source node.
   */
  get id() {
    return this.node.id;
  }

  get label() {
    return this.node.label;
  }

  get children() {
    return this.node.children;
  }
  set children(nodes) {
    this.node.children = nodes;
  }

  get type() {
    return this.node.type;
  }

  get terminology() {
    return this.node.terminology;
  }

  get parentDataClass() {
    return this.node.parentDataClass;
  }

  get dataModel() {
    return this.node.dataModel;
  }

  get deleted() {
    return this.node.deleted;
  }
  set deleted(d: boolean) {
    this.node.deleted = d;
  }

  get finalised() {
    return this.node.finalised;
  }
  set finalised(d: boolean) {
    this.node.finalised = d;
  }

  get domainType() {
    return this.node.domainType;
  }

  get hasChildren() {
    return this.node.hasChildren;
  }

  get parentFolder() {
    return this.node.parentFolder;
  }
}
