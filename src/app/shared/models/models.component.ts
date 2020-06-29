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
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InputModalComponent } from '@mdm/modals/input-modal/input-modal.component';

@Component({
  selector: 'mdm-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.sass']
})
export class ModelsComponent implements OnInit, OnDestroy {
  formData: any = {};
  activeTab = 0;
  allModels = null;
  filteredModels = null;
  isAdmin = this.securityHandler.isAdmin();
  inSearchMode = false;
  folder = '';
  searchboxFocused = false;
  debounceInputEvent: Subject<KeyboardEvent|InputEvent>;
  subscriptions: Subscription;

  // Hard
  includeSupersededDocModels = false;

  // Soft
  showSupersededModels = false;
  showDeletedModels = false;

  showFilters = false;

  currentTab = 'dataModels';
  classifierLoading = false;
  allClassifiers: any;
  reloading = false;

  currentClassification: any;
  allClassifications: any;
  classifiers: any;

  searchText: any;

  levels = {
    current: 0,
    currentFocusedElement: null,

    folders: () => {
      this.levels.current = 0;
      // $scope.filteredModels = $scope.filterDataModels(angular.copy($scope.allModels));
      this.reloadTree();
    },
    focusedElement: (node?) => {
      const self = this;
      if (node) {
        this.levels.currentFocusedElement = node;
      }

      this.reloading = true;

      if (this.levels.currentFocusedElement?.domainType === 'DataModel') {
        this.resources.tree.get(this.levels.currentFocusedElement.id).subscribe(result => {
            const children = result.body;
            self.levels.currentFocusedElement.children = children;
            self.levels.currentFocusedElement.open = true;
            self.levels.currentFocusedElement.selected = true;
            const curModel = {
              children: [self.levels.currentFocusedElement],
              isRoot: true
            };
            // $scope.filteredModels = $scope.filterDataModels(angular.copy(curModel));
            this.filteredModels = Object.assign({}, curModel);
            this.reloading = false;
            self.levels.current = 1;
          },
          error => {
            this.reloading = false;
          }
        );
      } else if (this.levels.currentFocusedElement?.domainType === 'Terminology') {
        this.resources.terminology.get(this.levels.currentFocusedElement.id, 'tree').subscribe(children => {
            self.levels.currentFocusedElement.children = children.body;
            self.levels.currentFocusedElement.open = true;
            self.levels.currentFocusedElement.selected = true;
            const curElement = {
              children: [self.levels.currentFocusedElement],
              isRoot: true
            };
            // $scope.filteredModels = $scope.filterDataModels(angular.copy(curElement));
            this.filteredModels = Object.assign({}, curElement);
            this.reloading = false;
            self.levels.current = 1;
          },
          error => {
            this.reloading = false;
          }
        );
      }
    }
  };

  constructor(
    private sharedService: SharedService,
    private validator: ValidatorService,
    private folderHandler: FolderHandlerService,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private title: Title,
    private securityHandler: SecurityHandlerService,
    private broadcastSvc: BroadcastService,
    private userSettingsHandler: UserSettingsHandlerService,
    protected messageHandler: MessageHandlerService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.title.setTitle('Models');

    if (this.sharedService.isLoggedIn()) {
      this.includeSupersededDocModels = this.userSettingsHandler.get('includeSupersededDocModels') || false;
      this.showSupersededModels = this.userSettingsHandler.get('showSupersededModels') || false;
      this.showDeletedModels = this.userSettingsHandler.get('showDeletedModels') || false;
    }

    if (
      this.sharedService.searchCriteria &&
      this.sharedService.searchCriteria.length > 0
    ) {
      this.formData.filterCriteria = this.sharedService.searchCriteria;
    }

    this.initializeModelsTree();

    this.broadcastSvc.subscribe('$reloadClassifiers', () => {
      this.resources.classifier.get(null, null, {all: true}).subscribe(data => {
        this.allClassifiers = data.items;
        this.classifiers = {
          children: data,
          isRoot: true
        };
      });
    });

    this.broadcastSvc.subscribe('$reloadFoldersTree', () => {
      this.loadFolders();
    });

    this.currentClassification = null;
    this.allClassifications = [];
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  isLoggedIn() {
    return this.sharedService.isLoggedIn();
  }


  tabSelected = tabIndex => {
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
  };

  loadClassifiers = () => {
    this.classifierLoading = true;
    this.resources.classifier.get(null, null, {all: true}).subscribe(result => {
        const data = result.body;
        this.allClassifiers = data.items;
        data.items.forEach(x => {
          x.hasChildren = false;
          x.domainType = 'Classification';
        });
        this.classifiers = {
          children: data.items,
          isRoot: true
        };
        this.classifierLoading = false;
      },
      () => {
        this.classifierLoading = false;
      }
    );
  };

  loadFolders = (noCache?) => {
    this.reloading = true;

    let options: any = {};
    if (this.sharedService.isLoggedIn()) {
      options = {
        queryStringParams: {
          includeDocumentSuperseded: this.userSettingsHandler.get('includeSupersededDocModels') || false,
          includeModelSuperseded: this.userSettingsHandler.get('showSupersededModels') || false,
          includeDeleted: this.userSettingsHandler.get('showDeletedModels') || false
        }
      };
    }
    if (noCache) {
      options.queryStringParams.noCache = true;
    }
    this.resources.tree.get(null, null, options).subscribe(result => {
        const data = result.body;
        this.allModels = {
          children: data,
          isRoot: true
        };
        this.filteredModels = Object.assign({}, this.allModels);
        this.reloading = false;
      }, () => {
        this.reloading = false;
      }
    );
  };

  onNodeClick = node => {
    this.stateHandler.Go(node.domainType, {
      id: node.id,
      edit: false,
      dataModelId: node.dataModel,
      dataClassId: node.parentDataClass || '',
      terminologyId: node.terminology
    });
  };

  onNodeDbClick = node => {
    // if the element if a dataModel, load it
    if (['DataModel', 'Terminology'].indexOf(node.domainType) === -1) {
      return;
    }
    this.levels.focusedElement(node);
  };

  onCompareTo = (source, target) => {
    this.stateHandler.NewWindow('modelscomparison', {
      sourceId: source.id,
      targetId: target ? target.id : null
    });
  };

  loadModelsToCompare = dataModel => {
    this.resources.dataModel.get(dataModel.id, 'semanticLinks', {filters: 'all=true'}).subscribe(result => {
      const compareToList = [];
      const semanticLinks = result.body;
      semanticLinks.items.forEach(link => {
        if (['Superseded By', 'New Version Of'].indexOf(link.linkType) !== -1 && link.source.id === dataModel.id) {
          compareToList.push(link.target);
        }
      });
    });
  };

  onFolderAddModal = () => {
    const promise = new Promise((resolve, reject) => {
      const dialog = this.dialog.open(InputModalComponent, {
        data: {
          inputValue: this.folder,
          modalTitle: 'Create a new Folder',
          okBtn: 'Add folder',
          btnType: 'primary',
          inputLabel: 'Folder name',
          message: 'Please enter the name of your Folder. <br> <strong>Note:</strong> This folder will be added at the top of the Tree'
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result) {
          if (this.validateLabel(result)) {
            this.folder = result;
            this.onAddFolder(null, null, this.folder);
          } else {
            const error = 'err';
            this.messageHandler.showError('DataModel name can not be empty', error);
            return promise;
          }
        } else {
          return promise;
        }
      });
    });
    return promise;
  }
  onAddFolder = function(event?, folder?, label?) {
    let parentId;
    if (folder) {
      parentId = folder.id;
    }
    let endpoint;
    if (parentId) {
      endpoint = this.folder.post(parentId, 'folders', {resource: {label}});
    } else {
      endpoint = this.resources.folder.post(null, null, {resource: {label}});
    }
    endpoint.subscribe(res => {
        const result = res.body;
        if (folder) {
          result.domainType = 'Folder';
          folder.children = folder.children || [];
          folder.children.push(result);
        } else {
          result.domainType = 'Folder';
          this.allModels.children.push(result);
          this.filteredModels.children.push(result);
        }

        // go to folder
        this.stateHandler.Go('Folder', {id: result.id, edit: false});

        this.messageHandler.showSuccess(`Folder ${label} created successfully.`);
        this.folder = '';
        this.loadFolders();
      },
      error => {
        this.messageHandler.showError('There was a problem creating the Folder.', error);
      });
  };

  onAddDataModel = (event, folder) => {
    this.stateHandler.Go('NewDataModelNew', {parentFolderId: folder.id});
  };

  onAddCodeSet = (event, folder) => {
    this.stateHandler.Go('NewCodeSet', {parentFolderId: folder.id});
  };

  onAddChildDataClass = (event, element) => {
    this.stateHandler.Go('NewDataClassNew', {
      grandParentDataClassId: element.domainType === 'DataClass' ? element.parentDataClass : null,
      parentDataModelId: element.domainType === 'DataModel' ? element.id : element.dataModel,
      parentDataClassId: element.domainType === 'DataModel' ? null : element.id
    });
  };

  onAddChildDataElement = (event, element) => {
    this.stateHandler.Go('NewDataElement', {
      grandParentDataClassId: element.parentDataClass ? element.parentDataClass : null,
      parentDataModelId: element.dataModel,
      parentDataClassId: element.id
    });
  };

  onAddChildDataType = (event, element) => {
    this.stateHandler.Go('NewDataType', {parentDataModelId: element.id});
  };

  toggleFilterMenu = () => {
    this.showFilters = !this.showFilters;
  };

  toggleFilters = filerName => {
    this[filerName] = !this[filerName];
    this.reloading = true;

    if (this.sharedService.isLoggedIn()) {
      this.userSettingsHandler.update('showSupersededModels', this.showSupersededModels);
      this.userSettingsHandler.update('showDeletedModels', this.showDeletedModels);
      this.userSettingsHandler.saveOnServer();
    }

    this.loadFolders();

    this.showFilters = !this.showFilters;
  };

  onDeleteFolder = (event, folder, permanent) => {
    if (!this.securityHandler.isAdmin()) {
      return;
    }
    if (event.permanent) {
      this.folderHandler.askForPermanentDelete(event.folder.id).then(() => {
        this.loadFolders();
      });
    } else {
      this.folderHandler.askForSoftDelete(event.folder.id).then(() => {
        event.folder.deleted = true;
      });
    }
  };

  initializeModelsTree = () => {
    this.loadFolders();
    this.loadClassifiers();
  };

  changeState = (newState, newWindow?) => {
    if (newWindow) {
      this.stateHandler.NewWindow(newState);
      return;
    }
    this.stateHandler.Go(newState);
  };

  onSearchInputKeyDown(event: KeyboardEvent|InputEvent) {
    // Initialize debounce listener if neccessary
    if (!this.debounceInputEvent) {
      this.debounceInputEvent = new Subject<KeyboardEvent|InputEvent>();
      this.subscriptions = this.debounceInputEvent.pipe(
        debounceTime(300)
      ).subscribe(e => {
        if (e instanceof KeyboardEvent) {
          switch (e.key) {
            case 'Enter': this.search(); return;
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

  search = () => {
    if (this.formData.filterCriteria?.trim().length > 2) {
      this.formData.ClassificationFilterCriteria = '';
      this.sharedService.searchCriteria = this.formData.filterCriteria;

      this.reloading = true;
      this.inSearchMode = true;
      this.allModels = [];

      this.resources.tree.get(null, 'search/' + this.sharedService.searchCriteria).subscribe(res => {
        const result = res.body;
        this.reloading = false;
        this.allModels = {
          children: result,
          isRoot: true
        };

        this.filteredModels = Object.assign({}, this.allModels); // $scope.filterDataModels();
        this.searchText = this.formData.filterCriteria;
      });
    } else {
      this.inSearchMode = false;
      this.sharedService.searchCriteria = '';
      this.searchText = '';
      this.loadFolders();
    }
  };

  classifierTreeOnSelect = node => {
    this.stateHandler.Go('classification', {id: node.id});
  };

  classificationFilterChange = val => {
    if (val && val.length !== 0 && val.trim().length === 0) {
      this.filterClassifications();
    } else {
      this.loadClassifiers();
    }
  };

  filterClassifications = function() {
    if (this.formData.ClassificationFilterCriteria.length > 0) {
      this.formData.filterCriteria = '';
      this.sharedService.searchCriteria = this.formData.ClassificationFilterCriteria;
    } else {
      this.loadClassifiers();
    }
  };

  onFavouriteDbClick = node => {
    this.onFavioureClick(node);
  };

  onFavouriteClick = node => {
    this.onFavioureClick(node);
  };

  reloadTree = () => {
    this.loadFolders(true);
  };

  addClassifier = () => {
    this.stateHandler.Go('newclassification');
  };

  private onFavioureClick(node) {
    this.stateHandler.Go(node.domainType, {
      id: node.id,
      dataModelId: node.dataModel,
      dataClassId: node.parentDataClass
    });
  }

  validateLabel = (data) => {
    if (!data || (data && data.trim().length === 0)) {
      return false;
    } else {
      return true;
    }
  }
}
