import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ElementRef,
  HostListener,
  SimpleChanges,
  ChangeDetectorRef, OnChanges, ViewChild
} from '@angular/core';
import {ResourcesService} from '../services/resources.service';
import {SecurityHandlerService} from '../services/handlers/security-handler.service';
import {UserSettingsHandlerService} from '../services/utility/user-settings-handler.service';
import {fromEvent, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';

@Component({
  selector: 'mdm-model-selector-tree',
  templateUrl: './model-selector-tree.component.html',
  // styleUrls: ['./model-selector-tree.component.sass']
})
export class ModelSelectorTreeComponent implements OnInit, OnChanges {

  @Input() root: any;
  @Output() rootChange = new EventEmitter<any>();

  @Input() defaultElements: any;

  @Input() defaultCheckedMap: any;

  @Input() onSelect: any;
  @Output() selectChange = new EventEmitter<any>();

  @Input() onCheck: any;
  @Output() checkChange = new EventEmitter<any>();
  @ViewChild('searchInputTreeControl', { static: true })
  searchInputTreeControl: ElementRef;

  selectedElementsVal: any;
  @Output() ngModelChange = new EventEmitter<any>();

  // @Input("ng-model") ngModel: any;

  @Input()
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


  @Input() isRequired: any;
  @Input() showValidationError: any;
  @Input() doNotShowDataClasses: any;
  @Input() doNotShowTerms: any;
  @Input() justShowFolders: any;

  @Input() placeholder: any;
  @Output() placeholderChange = new EventEmitter<any>();

  @Input() accepts: any;
  @Input() treeSearchDomainType: any; // "Folder" or "DataClass" or "DataModel" use as DomainType=xxx when searching in tree/search?domainType=DataModel
  @Input() readOnlySearchInput: any;
  @Input() multiple: any;
  @Input() processing: any;
  @Input() hideSelectedElements: any;
  @Input() alwaysShowTree: any = false;
  @Input() showCheckboxFor: any; // ['DataClass','DataModel','Folder']"
  @Input() propagateCheckbox: any;
  @Input() usedInModalDialogue: any;
  @Input() doNotApplySettingsFilter: any;

  showTree: any;
  placeholderStr: string;
  loading: boolean;
  rootNode: any;
  filteredRootNode: any;
  markChildren: any;
  selectedElements: any[] = [];
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
      // this.selectedElements.push(this.defaultElements);  TODO check why this is needed
      if (!this.multiple) {
        this.searchCriteria = this.selectedElements[0] ? this.selectedElements[0].label : null;
      }
    }

    if (changes.searchCriteria) {
      if (!this.multiple) {
        if (this.selectedElements && this.selectedElements.length > 0) {
          const label = this.selectedElements[0] ? this.selectedElements[0].label : '';
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


      const options = {
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

    fromEvent(this.searchInputTreeControl.nativeElement, 'keyup')
      .pipe(map((event: any) => {
          return event.target.value;
        }),
        filter((res: any) => res.length >= 0),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((text: string) => {
        if (text.length !== 0) {
          if (!this.multiple) {
            if (this.selectedElements && this.selectedElements.length > 0) {
              const label = this.selectedElements[0] ? this.selectedElements[0].label : '';
              if (this.selectedElements && text.trim().toLowerCase() === label.trim().toLowerCase() && label.trim().toLowerCase() !== '') {
                return;
              }
            }
          }

          const options = {
            queryStringParams : {
              domainType: this.treeSearchDomainType,
              includeDocumentSuperseded: true,
              includeModelSuperseded: true,
              includeDeleted: true
            }
          };


          if (this.searchCriteria.trim().length > 0) {
            this.inSearchMode = true;
            this.resources.tree.get(null, 'search/' + this.searchCriteria, options).subscribe( (result) => {
              this.filteredRootNode = {
                children: result.body,
                isRoot: true
              };
            });
          } else {
            this.inSearchMode = false;
            this.reload();
          }
        } else {
          this.reload(); }
      });

  }

  loadFolder(folder) {
    const id = (folder && folder.id) ? folder.id : null;
    this.loading = true;
    this.resources.folder.get(id, null, {all: true, sortBy: 'label'}).subscribe(data => {
      this.loading = false;
      this.rootNode = {
        children: data.body.items,
        isRoot: true
      };
      this.filteredRootNode = this.rootNode;

    }, function(error) {
      this.loading = false;
    });
  }

  loadTree(model) {
    const id = (model && model.id) ? model.id : null;
    this.loading = true;


    let options = {};

    if (!this.doNotApplySettingsFilter && this.securityHandler.isLoggedIn()) {
      if (this.userSettingsHandler.get('includeSupersededDocModels') || false) {
        options = {
          queryStringParams: {
            includeModelSuperseded: true,
          }
        };
      }
    } else {
      options = {
        queryStringParams: {
          includeDocumentSuperseded: true,
          includeModelSuperseded: true,
          includeDeleted: true
        }
      };
    }


    this.resources.tree.get(id, null, options).subscribe(data => {
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

  remove(event, element) {
    if (this.multiple) {
      const el = this.elementExists(element);
      this.selectedElements.splice(el.index, 1);
      if (this.onSelect) {
        this.onSelect(this.selectedElements);
      }
      this.selectChange.emit(element);
    }
  }

  elementExists(element) {
    let i = 0;
    while (this.selectedElements && i < this.selectedElements.length) {
      if (this.selectedElements[i] && this.selectedElements[i].id === element.id) {
        return {element: this.selectedElements[i], index: i};
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
      this.selectChange.emit(this.selectedElements);
    }
    this.searchCriteria = null;
    /// this.filteredRootNode = angular.copy(this.rootNode);TODO
    this.checkValidationError();
  }

  checkValidationError() {
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

  onNodeClick = (node) => {
    this.click(node);
  };

  onNodeDbClick = function(node) {
    this.click(node);
  };

  click = (node) => {
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
    }
    this.selectChange.emit(this.selectedElements);

    if (!this.multiple) {
      this.searchCriteria = this.selectedElements[0].label;
      this.showTree = false;
      this.changeRef.detectChanges();
    }

    this.ngModel = this.selectedElements;
    this.checkValidationError();
  };

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
  inputClick = () => {
    this.showTree = true;
  };

  // TODO NEEDS LOOK AT
  onAddFolder = (var1) => {

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
