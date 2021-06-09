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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { FolderHandlerService } from '@mdm/services/handlers/folder-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SharedService } from '@mdm/services/shared.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';
import { ValidatorService } from '@mdm/services/validator.service';
import { EMPTY, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DOMAIN_TYPE } from '@mdm/folders-tree/flat-node';
import { NodeConfirmClickEvent } from '@mdm/folders-tree/folders-tree.component';
import { EditingService } from '@mdm/services/editing.service';
import { Node } from '@mdm/folders-tree/flat-node';
import { ModelTreeService } from '@mdm/services/model-tree.service';
import {
  CatalogueItemDomainType,
  Classifier,
  ClassifierIndexResponse,
  ContainerDomainType} from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss']
})
export class ModelsComponent implements OnInit, OnDestroy {
  formData: any = {};
  activeTab = 0;
  allModels: Node = null;
  filteredModels = null;
  isAdmin = this.securityHandler.isAdmin();
  inSearchMode = false;
  folder = '';
  searchboxFocused = false;
  debounceInputEvent: Subject<KeyboardEvent | InputEvent>;
  subscriptions: Subscription;

  // Hard
  includeModelSuperseded = false;

  // Soft
  showSupersededModels = false;
  includeDeleted = false;

  showFilters = false;

  currentTab = 'dataModels';
  classifierLoading = false;
  allClassifiers: Classifier[];
  reloading = false;

  currentClassification: any;
  allClassifications: any;
  classifiers: { children: Classifier[]; isRoot: boolean };

  searchText: any;

  private unsubscribe$ = new Subject();

  levels = {
    current: 0,
    currentFocusedElement: null,

    folders: () => {
      this.levels.current = 0;
      this.reloadTree();
    },
    focusedElement: (node?) => {
      if (node) {
        this.levels.currentFocusedElement = node;
      }

      this.reloading = true;

      if (this.levels.currentFocusedElement?.domainType === 'DataModel') {
        this.resources.tree
          .get(
            'dataModels',
            this.levels.currentFocusedElement.domainType,
            this.levels.currentFocusedElement.id
          )
          .subscribe(
            (result) => {
              const children = result.body;
              this.levels.currentFocusedElement.children = children;
              this.levels.currentFocusedElement.open = true;
              this.levels.currentFocusedElement.selected = true;
              const curModel = {
                children: [this.levels.currentFocusedElement],
                isRoot: true
              };
              this.filteredModels = Object.assign({}, curModel);
              this.reloading = false;
              this.levels.current = 1;
            },
            () => {
              this.reloading = false;
            }
          );
      } else if (
        this.levels.currentFocusedElement?.domainType === 'Terminology'
      ) {
        this.resources.tree
          .get(
            'terminologies',
            this.levels.currentFocusedElement.domainType,
            this.levels.currentFocusedElement.id
          )
          .subscribe(
            (children) => {
              this.levels.currentFocusedElement.children = children.body;
              this.levels.currentFocusedElement.open = true;
              this.levels.currentFocusedElement.selected = true;
              const curElement = {
                children: [this.levels.currentFocusedElement],
                isRoot: true
              };
              this.filteredModels = Object.assign({}, curElement);
              this.reloading = false;
              this.levels.current = 1;
            },
            () => {
              this.reloading = false;
            }
          );
      }
    }
  }

  constructor(
    private sharedService: SharedService,
    private validator: ValidatorService,
    private folderHandler: FolderHandlerService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private title: Title,
    private securityHandler: SecurityHandlerService,
    private broadcast: BroadcastService,
    private userSettingsHandler: UserSettingsHandlerService,
    protected messageHandler: MessageHandlerService,
    public dialog: MatDialog,
    private editingService: EditingService,
    private modelTree: ModelTreeService
  ) { }

  ngOnInit() {
    this.title.setTitle('Models');

    if (this.sharedService.isLoggedIn()) {
      this.includeModelSuperseded =
        this.userSettingsHandler.get('includeModelSuperseded') || false;
      this.showSupersededModels =
        this.userSettingsHandler.get('showSupersededModels') || false;
      this.includeDeleted =
        this.userSettingsHandler.get('includeDeleted') || false;
    }

    if (
      this.sharedService.searchCriteria &&
      this.sharedService.searchCriteria.length > 0
    ) {
      this.formData.filterCriteria = this.sharedService.searchCriteria;
    }

    this.initializeModelsTree();

    this.broadcast
      .onReloadCatalogueTree()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.loadModelsTree(true));

    this.currentClassification = null;
    this.allClassifications = [];
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }

    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isLoggedIn() {
    return this.sharedService.isLoggedIn();
  }

  tabSelected(tabIndex: number) {
    switch (tabIndex) {
      case 0: {
        return (this.currentTab = 'models');
      }
      case 1: {
        return (this.currentTab = 'classifications');
      }
      case 2: {
        return (this.currentTab = 'favourites');
      }
      default: {
        this.currentTab = 'models';
      }
    }
  }

  loadClassifiers() {
    this.classifierLoading = true;
    this.resources.classifier.list({ all: true }).subscribe(
      (result: ClassifierIndexResponse) => {
        const data = result.body.items;
        this.allClassifiers = data;
        data.forEach((classifier) => {
          classifier.domainType = CatalogueItemDomainType.Classification;
        });
        this.classifiers = {
          children: data,
          isRoot: true
        };
        this.classifierLoading = false;
      },
      () => {
        this.classifierLoading = false;
      }
    );
  }

  loadModelsTree(noCache?: boolean) {
    this.reloading = true;

    // Fetch tree information from two potential sources - local folder tree and possible (external)
    // subscribed catalogues
    //
    // Fetch one resource at a time to avoid any 404s
    this.modelTree
      .getLocalCatalogueTreeNodes(noCache)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem loading the model tree.', error);
          return EMPTY;
        }),
        switchMap(local => {
          return this.modelTree
            .getSubscribedCatalogueTreeNodes()
            .pipe(
              map(subscribed => {
                if ((subscribed?.length ?? 0) === 0) {
                  // Display only local catalogue folders/models
                  return this.modelTree.createRootNode(local);
                }

                // Combine sub tree nodes with new parent nodes to build up roots
                const localParent = this.modelTree.createLocalCatalogueNode(local);
                const externalParent = this.modelTree.createExternalCataloguesNode(
                  subscribed
                );
                return this.modelTree.createRootNode([localParent, externalParent]);
              }),
              catchError(() => {
                this.messageHandler.showWarning('There was a problem loading the model tree with subscribed catalogues. Showing only local instance models.');

                // Display only local catalogue folders/models
                return of(this.modelTree.createRootNode(local));
              }),
            );
        }),
        finalize(() => this.reloading = false)
      )
      .subscribe(node => {
        this.allModels = node;
        this.filteredModels = node;
      });
  }

  onNodeConfirmClick($event: NodeConfirmClickEvent) {
    const node = $event.next.node;

    this.stateHandler
      .Go(node.domainType, {
        id: node.id,
        edit: false,
        dataModelId: node.modelId,
        dataClassId: node.parentId || '',
        terminologyId: node.modelId || node.model,
        dataModel: node.dataModel,
        parentId: node.parentId
      })
      .then(
        () => $event.setSelectedNode($event.next),
        () => $event.setSelectedNode($event.current)
      );
  }

  onNodeClick(node: Node) {
    this.modelTree.currentNode = node;
  }

  onNodeDbClick(node: Node ){
    this.modelTree.currentNode = node;

    // if the element if a dataModel, load it
    if (
      [DOMAIN_TYPE.DataModel, DOMAIN_TYPE.Terminology].indexOf(
        node.domainType
      ) === -1
    ) {
      return;
    }
    this.levels.focusedElement(node);
  }

  loadModelsToCompare(dataModel: any) {
    this.resources.catalogueItem
      .listSemanticLinks(dataModel.domainType, dataModel.id, { all: true })
      .subscribe((result) => {
        const compareToList = [];
        const semanticLinks = result.body;
        semanticLinks.items.forEach((link) => {
          if (
            ['Superseded By', 'New Version Of'].indexOf(link.linkType) !== -1 &&
            link.source.id === dataModel.id
          ) {
            compareToList.push(link.target);
          }
        });
      });
  }

  onFolderAddModal() {
    this.modelTree
      .createNewFolder()
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem creating the Folder.', error);
          return EMPTY;
        })
      )
      .subscribe(response => {
        const item = response.body;
        this.filteredModels.children.push(item);

        this.stateHandler.Go(item.domainType, { id: item.id, edit: false });
        this.messageHandler.showSuccess(`Folder ${item.label} created successfully.`);
        this.folder = '';
        this.loadModelsTree();
      });
  }

  onAddDataModel(folder: any) {
    this.stateHandler.Go('NewDataModel', { parentFolderId: folder.id });
  }

  onAddCodeSet(folder: any) {
    this.stateHandler.Go('NewCodeSet', { parentFolderId: folder.id });
  }

  onAddChildDataClass(element: any) {
    this.stateHandler.Go('NewDataClassNew', {
      grandParentDataClassId:
        element.domainType === 'DataClass' ? element.parentDataClass : null,
      parentDataModelId:
        element.domainType === 'DataModel' ? element.id : element.dataModel,
      parentDataClassId: element.domainType === 'DataModel' ? null : element.id
    });
  }

  onAddChildDataElement(element: any) {
    this.stateHandler.Go('NewDataElement', {
      grandParentDataClassId: element.parentDataClass
        ? element.parentDataClass
        : null,
      parentDataModelId: element.dataModel,
      parentDataClassId: element.id
    });
  }

  onAddChildDataType(element: any) {
    this.stateHandler.Go('NewDataType', { parentDataModelId: element.id });
  }

  toggleFilterMenu() {
    this.showFilters = !this.showFilters;
  }

  toggleFilters(filerName: string) {
    this[filerName] = !this[filerName];
    this.reloading = true;

    if (this.sharedService.isLoggedIn()) {
      this.userSettingsHandler.update(
        'includeModelSuperseded',
        this.includeModelSuperseded
      );
      this.userSettingsHandler.update(
        'showSupersededModels',
        this.showSupersededModels
      );
      this.userSettingsHandler.update('includeDeleted', this.includeDeleted);
      this.userSettingsHandler.saveOnServer();
    }
    this.loadModelsTree();
    this.showFilters = !this.showFilters;
  }

  onDeleteFolder(event: any) {
    if (!this.securityHandler.isAdmin()) {
      return;
    }
    if (event.permanent) {
      this.folderHandler
        .askForPermanentDelete(event.folder.id)
        .subscribe(() => {
          this.broadcast.reloadCatalogueTree();
          this.stateHandler.Go(
            'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
          );
        });
    } else {
      this.folderHandler.askForSoftDelete(event.folder.id).subscribe(() => {
        event.folder.deleted = true;
      });
    }
  }

  initializeModelsTree() {
    this.loadModelsTree();
    this.loadClassifiers();
  }

  changeState(newState: string, type?: string, newWindow?: boolean) {
    if (newWindow) {
      this.stateHandler.NewWindow(newState);
      return;
    }
    if (newState) {
      if (newState === 'import') {
        this.stateHandler.Go(newState, { importType: type });
      } else if (newState === 'export') {
        this.stateHandler.Go(newState, { exportType: type });
      }
      return;
    }

    this.stateHandler.Go(newState);
  }

  onSearchInputKeyDown(event: KeyboardEvent | InputEvent) {
    // Initialize debounce listener if necessary
    if (!this.debounceInputEvent) {
      this.debounceInputEvent = new Subject<KeyboardEvent | InputEvent>();
      this.subscriptions = this.debounceInputEvent
        .pipe(debounceTime(300))
        .subscribe((e) => {
          if (e instanceof KeyboardEvent) {
            switch (e.key) {
              case 'Enter':
                this.search();
                return;
              case 'Escape':
                this.formData.filterCriteria = '';
                this.search();
                this.searchboxFocused = false;
                return;
            }
          }

          if (this.formData.filterCriteria?.length > 2) {
            this.search();
          }

          if (this.validator.isEmpty(this.formData.filterCriteria)) {
            this.search();
          }
        });
    }

    event.preventDefault();
    event.stopPropagation();
    this.debounceInputEvent.next(event);
    return false;
  }

  search() {
    if (this.formData.filterCriteria?.trim().length > 2) {
      this.formData.ClassificationFilterCriteria = '';
      this.sharedService.searchCriteria = this.formData.filterCriteria;

      this.reloading = true;
      this.inSearchMode = true;
      this.allModels = null;

      this.resources.tree
        .search(ContainerDomainType.FOLDERS, this.sharedService.searchCriteria)
        .subscribe((res) => {
          const result: Node[] = res.body;
          this.reloading = false;
          this.allModels = {
            id: '',
            domainType: DOMAIN_TYPE.Root,
            children: result,
            hasChildren: true,
            isRoot: true
          };

          this.filteredModels = Object.assign({}, this.allModels);
          this.searchText = this.formData.filterCriteria;
        });
    } else {
      this.inSearchMode = false;
      this.sharedService.searchCriteria = '';
      this.searchText = '';
      this.loadModelsTree();
    }
  }

  classifierTreeOnSelect(node: Node) {
    this.stateHandler.Go('classification', { id: node.id });
  }

  classificationFilterChange(val: string) {
    if (val && val.length !== 0 && val.trim().length === 0) {
      this.filterClassifications();
    } else {
      this.loadClassifiers();
    }
  }

  filterClassifications() {
    if (this.formData.ClassificationFilterCriteria.length > 0) {
      this.formData.filterCriteria = '';
      this.sharedService.searchCriteria = this.formData.ClassificationFilterCriteria;
    } else {
      this.loadClassifiers();
    }
  }

  onFavouriteDbClick(node: Node) {
    this._onFavouriteClick(node);
  }

  onFavouriteClick(node: Node) {
    this._onFavouriteClick(node);
  }

  reloadTree() {
    this.loadModelsTree(true);
  }

  onAddClassifier() {
    this.modelTree
      .createNewClassifier()
      .pipe(
        catchError(error => {
          this.messageHandler.showError('Classification name can not be empty', error);
          return EMPTY;
        })
      )
      .subscribe(response => {
        this.messageHandler.showSuccess('Classifier saved successfully.');
        this.stateHandler.Go('classification', { id: response.body.id });
        this.loadClassifiers();
      });
  }

  private _onFavouriteClick(node: Node) {
    this.stateHandler.Go(node.domainType, {
      id: node.id,
      dataModelId: node.dataModel,
      dataClassId: node.parentDataClass
    });
  }
}
