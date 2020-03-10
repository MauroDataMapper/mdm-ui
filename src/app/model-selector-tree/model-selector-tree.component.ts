import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ElementRef,
  HostListener,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import {ResourcesService} from '../services/resources.service';
import {SecurityHandlerService} from '../services/handlers/security-handler.service';
import {UserSettingsHandlerService} from '../services/utility/user-settings-handler.service';

@Component({
  selector: 'model-selector-tree',
  templateUrl: './model-selector-tree.component.html',
  // styleUrls: ['./model-selector-tree.component.sass']
})
export class ModelSelectorTreeComponent implements OnInit {

    @Input() root: any;
    @Output() rootChange = new EventEmitter<any>();

    @Input('default-elements') defaultElements: any;

    @Input('default-checked-map') defaultCheckedMap: any;

    @Input('on-select') onSelect: any;
    @Output() onSelectChange = new EventEmitter<any>();

    @Input('on-check') onCheck: any;
    @Output() onCheckChange = new EventEmitter<any>();

    selectedElementsVal: any ;
    @Output() ngModelChange = new EventEmitter<any>();
   // @Input("ng-model") ngModel: any;

    @Input('ng-model')
    get ngModel() {
        return this.selectedElements;
    }

    set ngModel(val) {
        this.selectedElementsVal = val;
        if (val === null || val === undefined) {
            this.selectedElements = [];
        } else {
            this.selectedElements = val;
        }
        this.ngModelChange.emit(this.selectedElementsVal);
    }


    @Input('is-required') isRequired: any;
    @Input('show-validation-error') showValidationError: any;
    @Input('do-not-show-data-classes') doNotShowDataClasses: any;
    @Input('do-not-show-terms') doNotShowTerms: any;
    @Input('just-show-folders') justShowFolders: any;

    @Input() placeholder: any;
    @Output() placeholderChange = new EventEmitter<any>();

    @Input() accepts: any;
    @Input('tree-search-domain-type') treeSearchDomainType: any; // "Folder" or "DataClass" or "DataModel" use as DomainType=xxx when searching in tree/search?domainType=DataModel
    @Input('read-only-search-input') readOnlySearchInput: any;
    @Input() multiple: any;
    @Input() processing: any;
    @Input('hide-selected-elements') hideSelectedElements: any;
    @Input('always-show-tree') alwaysShowTree: any = false;
    @Input('show-checkbox-for') showCheckboxFor: any; // ['DataClass','DataModel','Folder']"
    @Input('propagate-checkbox') propagateCheckbox: any;
    @Input('used-in-modal-dialogue') usedInModalDialogue: any;
    @Input('do-not-apply-settings-filter') doNotApplySettingsFilter: any;

  showTree: any;
  placeholderStr: string;
  loading: boolean;
  rootNode: any;
  filteredRootNode: any;
  markChildren: any;
  selectedElements = [];
  searchCriteria: any;
  hasValidationError: boolean;
  inSearchMode: any;
  wasInside = false;

  constructor(private resources: ResourcesService, private securityHandler: SecurityHandlerService, private userSettingsHandler: UserSettingsHandlerService, private eRef: ElementRef, private changeRef: ChangeDetectorRef) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
        if (changes.defaultElements) {
      this.selectedElements.push(this.defaultElements);
      if (!this.multiple) {
        this.searchCriteria = this.selectedElements[0] ? this.selectedElements[0].label : null;
      }
    }

        if (changes.searchCriteria) { if (!this.multiple) {
      if (this.selectedElements && this.selectedElements.length > 0) {
          let label = this.selectedElements[0] ? this.selectedElements[0].label : '';
          if (this.selectedElements &&
              this.searchCriteria.trim().toLowerCase() === label.trim().toLowerCase() &&
              label.trim().toLowerCase() !== '') {
              return;
          }
      }
  }

  // $scope.filteredRootNode = angular.copy($scope.rootNode);
  // $scope.filterDataModels($scope.filteredRootNode, newValue);
  // $scope.showTree = true;


      let options = {
      queryStringParams: {
          domainType: this.treeSearchDomainType,
          includeDocumentSuperseded: true,
          includeModelSuperseded: true,
          includeDeleted: true
      }
  };


      if (this.searchCriteria.trim().length > 0) {
    this.inSearchMode = true;
    this.resources.tree.get(null, 'search/' + this.searchCriteria, options).subscribe(
          (result) => {
              this.filteredRootNode = {
                  children: result.body,
                  isRoot: true
              };
          });
  } else {
      this.inSearchMode = false;
      this.reload();
  }


    }
  }

  ngOnInit() {

      this.showTree = this.alwaysShowTree;
      this.placeholderStr = this.placeholder ? this.placeholder : 'Select';
      this.reload();

  }

  loadFolder (folder) {
    let id = (folder && folder.id) ? folder.id : null;
    this.loading = true;
    this.resources.folder.get(id, null, {all: true, sortBy: 'label'}).subscribe( data => {
      this.loading = false;
      this.rootNode = {
        children: data.items,
        isRoot: true
      };
      this.filteredRootNode = this.rootNode;

    }, function(error) {
      this.loading = false;
    });
  }

  loadTree(model) {
    let id = (model && model.id) ? model.id : null;
    this.loading = true;


    let options = {};

    if (!this.doNotApplySettingsFilter && this.securityHandler.isLoggedIn()) {
      if (this.userSettingsHandler.get('includeSupersededDocModels') || false) {
        options = {
          queryStringParams : {
            includeModelSuperseded: true,
          }
        };
      }
    } else {
      options = {
        queryStringParams : {
          includeDocumentSuperseded: true,
          includeModelSuperseded: true,
          includeDeleted: true
        }
      };
    }


    this.resources.tree.get(id, null , options).subscribe(data => {
      this.loading = false;
      this.rootNode = {
        children: data.body,
        isRoot: true
      };
      this.filteredRootNode = this.rootNode;

      if (this.defaultCheckedMap && this.markChildren) {
        this.markChildren(this.filteredRootNode);
        }

    }, function(error) {
      this.loading = false;
    });
  }

    remove (event, element) {
        if (this.multiple) {
            let el = this.elementExists(element);
            this.selectedElements.splice(el.index, 1);
            if (this.onSelect) {
                this.onSelect(this.selectedElements);
            }
        }
    }

    elementExists(element) {
        let i = 0;
        while (this.selectedElements && i < this.selectedElements.length) {
            if (this.selectedElements[i] && this.selectedElements[i].id === element.id) {
                return { element: this.selectedElements[i], index: i };
            }
            i++;
        }
        return null;
    }

    cleanSelection() {
        if (!this.multiple) {
            this.selectedElements = [];
           // this.safeApply();

            this.ngModel = this.selectedElements;
            this.checkValidationError();

            if (this.onSelect) {
                this.onSelect(this.selectedElements);
            }
        }
        this.searchCriteria = null;
       /// this.filteredRootNode = angular.copy(this.rootNode);TODO
        this.checkValidationError();
    }

    checkValidationError () {
        this.hasValidationError = false;
        if (this.isRequired && this.showValidationError) {

            if (this.multiple && this.selectedElements.length === 0) {
                this.hasValidationError = true;
            }
            if (!this.multiple &&
                (!this.selectedElements ||
                    (this.selectedElements && this.selectedElements.length === 0))) {
                this.hasValidationError = true;
            }
        }
    }

    toggleTree() {

        if (this.alwaysShowTree) {
            this.showTree = true;
            return;
        }
        this.showTree = !this.showTree;
    }

    @HostListener('click')
    clickInside() {
       this.wasInside = true;
    }

    @HostListener('document:click')
    clickout() {
        if (!this.wasInside) {
           this.showTree = false;
        }
        this.wasInside = false;
    }

    onNodeClick =  (node) => {
        this.click(node);
    }

    onNodeDbClick = function(node) {
        this.click(node);
    };

    click =  (node) => {
        this.hasValidationError = false;

        if (this.accepts && this.accepts.indexOf(node.domainType) === -1) {
            this.checkValidationError();
            return;
        }

        if (this.elementExists(node)) {
            this.checkValidationError();
            return;
        }

        if (!this.multiple) {
            this.selectedElements = null;
        }

        if (!this.selectedElements) {
            this.selectedElements = [];
        }

        this.selectedElements.push(node);


        if (this.onSelect) {
            this.onSelect(this.selectedElements);
            this.onSelectChange.emit(this.selectedElements);
        }
        if (!this.multiple) {
            this.searchCriteria = this.selectedElements[0].label;
            this.showTree = false;
            this.changeRef.detectChanges();
        }

        this.ngModel = this.selectedElements;
        this.checkValidationError();
    }

    onNodeChecked(node, parent, checkedList) {
        if (this.onCheck) {
            this.onCheck(node, parent, checkedList);
        }
    }

    reload() {
    if (this.justShowFolders) {
      this.loadFolder(this.root);
    } else {
      this.loadTree(this.root);
    }
  }



  // TODO NEEDS LOOK AT
  onAddFolder = (var1)  => {

  }
  // this.reload();//TODO


  // markChildren (node){
  //   if(this.defaultCheckedMap[node.id]){
  //     node.checked = true;
  //   }
  //   if(this.propagateCheckbox) {
  //     angular.forEach(node.children, function (n) {
  //       n.disableChecked = status;
  //       this.markChildren(n, null, status);
  //     });
  //   }
  // };


}
