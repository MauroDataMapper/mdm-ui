import {Component, OnInit, Inject} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {SecurityHandlerService} from '../../services/handlers/security-handler.service';
import {UserSettingsHandlerService} from '../../services/utility/user-settings-handler.service';
import {ResourcesService} from '../../services/resources.service';
import {StateHandlerService} from '../../services/handlers/state-handler.service';
import {FolderHandlerService} from '../../services/handlers/folder-handler.service';
import {ValidatorService} from '../../services/validator.service';
import {BroadcastService} from '../../services/broadcast.service';
import {SharedService} from '../../services/shared.service';
import {MessageHandlerService} from '../../services/utility/message-handler.service';

@Component({
  selector: 'mdm-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.sass']
})
export class ModelsComponent implements OnInit {
  formData: any = {};
  activeTab = 0;
  allModels = null;
  filteredModels = null;
  isAdmin = this.securityHandler.isAdmin();
  inSearchMode = false;

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
        this.resources.tree.get(this.levels.currentFocusedElement.id).subscribe(
          result => {
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
        this.resources.terminology
          .get(this.levels.currentFocusedElement.id, 'tree')
          .subscribe(
            children => {
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
    private resources: ResourcesService,
    private title: Title,
    private securityHandler: SecurityHandlerService,
    private broadcastSvc: BroadcastService,
    private userSettingsHandler: UserSettingsHandlerService,
    protected messageHandler: MessageHandlerService
  ) {
  }

  ngOnInit() {
    this.title.setTitle('Models');

    if (this.sharedService.isLoggedIn()) {
      this.includeSupersededDocModels =
        this.userSettingsHandler.get('includeSupersededDocModels') || false;
      this.showSupersededModels =
        this.userSettingsHandler.get('showSupersededModels') || false;
      this.showDeletedModels =
        this.userSettingsHandler.get('showDeletedModels') || false;
    }

    if (
      this.sharedService.searchCriteria &&
      this.sharedService.searchCriteria.length > 0
    ) {
      this.formData.filterCriteria = this.sharedService.searchCriteria;
    }

    this.initializeModelsTree();

    this.broadcastSvc.subscribe('$reloadClassifiers', () => {
      this.resources.classifier
        .get(null, null, {all: true})
        .subscribe(data => {
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
    this.resources.classifier.get(null, null, {all: true}).subscribe(
      result => {
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
          includeDocumentSuperseded:
            this.userSettingsHandler.get('includeSupersededDocModels') || false,
          includeModelSuperseded:
            this.userSettingsHandler.get('showSupersededModels') || false,
          includeDeleted:
            this.userSettingsHandler.get('showDeletedModels') || false
        }
      };
    }
    if (noCache) {
      options.queryStringParams.noCache = true;
    }
    this.resources.tree.get(null, null, options).subscribe(
      result => {
        const data = result.body;
        this.allModels = {
          children: data,
          isRoot: true
        };
        this.filteredModels = Object.assign({}, this.allModels);
        this.reloading = false;
      },
      () => {
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
    this.resources.dataModel
      .get(dataModel.id, 'semanticLinks', {filters: 'all=true'})
      .subscribe(result => {
        const compareToList = [];
        const semanticLinks = result.body;
        semanticLinks.items.forEach(link => {
          if (
            ['Superseded By', 'New Version Of'].indexOf(link.linkType) !== -1 &&
            link.source.id === dataModel.id
          ) {
            compareToList.push(link.target);
          }
        });
      });
  };

  onAddFolder = function(event?, folder?) {
    let parentId;
    if (folder) {
      parentId = folder.id;
    }
    let endpoint;
    if (parentId) {
      endpoint = this.folder.post(parentId, 'folders', {resource: {}});
    } else {
      endpoint = this.resources.folder.post(null, null, {resource: {}});
    }
    endpoint.subscribe(
      res => {
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
        this.stateHandler.Go('Folder', {id: result.id, edit: true});

        this.messageHandler.showSuccess('Folder created successfully.');
      },
      error => {
        this.messageHandler.showError(
          'There was a problem creating the Folder.',
          error
        );
      }
    );
  };

  onAddDataModel = (event, folder) => {
    this.stateHandler.Go('NewDataModelNew', {parentFolderId: folder.id});
  };

  onAddCodeSet = (event, folder) => {
    this.stateHandler.Go('NewCodeSet', {parentFolderId: folder.id});
  };

  onAddChildDataClass = (event, element) => {
    this.stateHandler.Go('NewDataClassNew', {
      grandParentDataClassId:
        element.domainType === 'DataClass' ? element.parentDataClass : null,
      parentDataModelId:
        element.domainType === 'DataModel' ? element.id : element.dataModel,
      parentDataClassId: element.domainType === 'DataModel' ? null : element.id
    });
  };

  onAddChildDataElement = (event, element) => {
    this.stateHandler.Go('NewDataElement', {
      grandParentDataClassId: element.parentDataClass
        ? element.parentDataClass
        : null,
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
      this.userSettingsHandler.update(
        'showSupersededModels',
        this.showSupersededModels
      );
      this.userSettingsHandler.update(
        'showDeletedModels',
        this.showDeletedModels
      );
      this.userSettingsHandler.saveOnServer();
    }

    this.loadFolders();

    this.showFilters = !this.showFilters;
  };

  onDeleteFolder = (event, folder, permanent) => {
    if (!this.sharedService.isAdmin()) {
      return;
    }
    if (permanent === true) {
      this.folderHandler.askForPermanentDelete(folder.id).then(() => {
        this.loadFolders();
      });
    } else {
      this.folderHandler.askForSoftDelete(folder.id).then(() => {
        folder.deleted = true;
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

  onSearchInputKeyDown = event => {
    if (event.keyCode && event.keyCode === 13) {
      this.search();
    }
    if (this.validator.isEmpty(this.formData.filterCriteria)) {
      this.search();
    }
    event.preventDefault();
    return false;
  };

  search = () => {
    if (this.formData.filterCriteria.trim().length > 2) {
      this.formData.ClassificationFilterCriteria = '';
      this.sharedService.searchCriteria = this.formData.filterCriteria;

      this.reloading = true;
      this.inSearchMode = true;
      this.allModels = [];

      this.resources.tree
        .get(null, 'search/' + this.sharedService.searchCriteria)
        .subscribe(res => {
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
}
