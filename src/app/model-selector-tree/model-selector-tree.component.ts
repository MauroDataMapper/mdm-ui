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
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { UserSettingsHandlerService } from '../services/utility/user-settings-handler.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { CatalogueItemDomainType, ContainerDomainType, FolderIndexResponse, MdmTreeItem, MdmTreeItemListResponse, TreeItemSearchQueryParameters } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-model-selector-tree',
  templateUrl: './model-selector-tree.component.html',
  styleUrls: ['./model-selector-tree.component.sass']
})
export class ModelSelectorTreeComponent implements OnInit, OnChanges {
  @Input() root: any;
  @Output() rootChange = new EventEmitter<any>();
  @Input() defaultElements: any;
  @Input() defaultCheckedMap: any;
  @Input() onSelect: any;
  @Output() selectChange = new EventEmitter<any>();
  @Input() onCheck: any;
  @Input() isRequired: any;
  @Input() showValidationError: any;
  @Input() doNotShowDataClasses: any;
  @Input() doNotShowTerms: any;
  @Input() justShowFolders: any;
  @Input() placeholder: any;
  @Output() placeholderChange = new EventEmitter<any>();
  @Input() accepts: CatalogueItemDomainType[];
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
  @Input() folderFilterFn: (f: MdmTreeItem) => boolean;
  @Output() checkChange = new EventEmitter<any>();
  @Output() ngModelChange = new EventEmitter<any>();
  @ViewChild('searchInputTreeControl', { static: true })
  searchInputTreeControl: ElementRef;
  selectedElementsVal: MdmTreeItem[];
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

  showTree: any;
  placeholderStr: string;
  loading: boolean;
  rootNode: any;
  filteredRootNode: any;
  markChildren: any;
  selectedElements: MdmTreeItem[] = [];
  searchCriteria: any;
  hasValidationError: boolean;
  inSearchMode: any;
  wasInside = false;

  @HostListener('click')
  clickInside() {
    this.wasInside = true;
  }

  @HostListener('document:click')
  clickout() {
    if (!this.wasInside) {
      this.showTree = false;
    }
    if (this.alwaysShowTree) {
      this.showTree = true;
    }
    this.wasInside = false;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor(private resources: MdmResourcesService, private securityHandler: SecurityHandlerService, private userSettingsHandler: UserSettingsHandlerService, private changeRef: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.defaultElements) {
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

      const options: TreeItemSearchQueryParameters = {
        searchTerm: this.searchCriteria,
        domainType: this.treeSearchDomainType,
        includeDocumentSuperseded: true,
        includeModelSuperseded: true,
        includeDeleted: true
      };

      if (this.searchCriteria.trim().length > 0) {
        this.inSearchMode = true;
        this.resources.tree.search(ContainerDomainType.Folders, this.searchCriteria, options).subscribe((result: MdmTreeItemListResponse) => {
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

    fromEvent(this.searchInputTreeControl.nativeElement, 'keyup').pipe(map((event: any) => {
        return event.target.value;
      }),
      filter((res: any) => res.length >= 0),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((text: string) => {
      if (text.length !== 0) {
        if (!this.multiple) {
          if (this.selectedElements && this.selectedElements.length > 0) {
            const label = this.selectedElements[0]?.label ? this.selectedElements[0].label : '';
            if (this.selectedElements && text?.trim().toLowerCase() === label?.trim().toLowerCase() && label?.trim().toLowerCase() !== '') {
              return;
            }
          }
        }
        if (this.searchCriteria.trim().length > 0) {
          this.inSearchMode = true;
          this.resources.tree.search(ContainerDomainType.Folders, this.searchCriteria).subscribe((result: MdmTreeItemListResponse) => {
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
        this.reload();
      }
    });
  }

  loadFolder(folder) {
    const id = (folder && folder.id) ? folder.id : null;
    this.loading = true;
    if (folder?.id) {
      this.resources.folder.get(id).subscribe((data: FolderIndexResponse) => {
        const children = data.body.items;
        this.loading = false;
        this.rootNode = {
          children,
          isRoot: true
        };
        this.filteredRootNode = this.rootNode;
      }, () => {
        this.loading = false;
      });
    } else {
      this.resources.tree.list(ContainerDomainType.Folders, {foldersOnly: true}).subscribe((data: MdmTreeItemListResponse) => {
        // TODO: this is not a very "Angular way" of filtering data for a component, really the data should be filterd
        // outside the component and passed into this component as an @Input(), making this a "dumb" component.
        // Issue currently is that this component is already heavily used and cannot be refactored yet, consider for
        // the future.
        const children = this.folderFilterFn ? this.filterFolderTreeItems(data.body) : data.body;
        this.loading = false;
        this.rootNode = {
          children,
          isRoot: true
        };
        this.filteredRootNode = this.rootNode;

        if ((this.selectedElements?.length ?? 0) > 0 && !this.multiple) {
          // If a node has already been initially selected, update the input field to
          // display it
          this.searchCriteria = this.selectedElements[0].label;
        }

      }, () => {
        this.loading = false;
      });
    }
  }

  loadTree(model) {
    const id = (model && model.id) ? model.id : null;
    this.loading = true;
    let options: any = {};
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

    let method = this.resources.tree.list(ContainerDomainType.Folders, options.queryStringParams);


    if (id) {
      method = this.resources.tree.get('folders', 'dataModel', id, options);
    }

    method.subscribe(data => {
      this.loading = false;
      this.rootNode = {
        children: data.body,
        isRoot: true
      };
      this.filteredRootNode = this.rootNode;
      if (this.defaultCheckedMap && this.markChildren) {
        this.markChildren(this.filteredRootNode);
      }
    }, () => {
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
        return { element: this.selectedElements[i], index: i };
      }
      i++;
    }
    return null;
  }

  cleanSelection() {
    if (!this.multiple) {
      this.selectedElements = [];

      this.ngModel = this.selectedElements;
      this.checkValidationError();

      if (this.onSelect) {
        this.onSelect(this.selectedElements);
      }
      this.selectChange.emit(this.selectedElements);
    }
    this.searchCriteria = null;
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


  onNodeClick(node: MdmTreeItem) {
    this.selectNode(node);
  }

  onNodeDbClick(node: MdmTreeItem) {
    this.selectNode(node);
  }

  selectNode(node: MdmTreeItem) {
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

      if (this.alwaysShowTree) {
        this.showTree = true;
      } else {
        this.showTree = false;
      }
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
  inputClick = () => {
    this.showTree = true;
  };

  // TODO
  onAddFolder = () => { };

  private filterFolderTreeItems(folders?: MdmTreeItem[]): MdmTreeItem[] {
    // Recursively filter the folder items and their children
    return folders.filter(folder => {
      if (folder.children && folder.children.length > 0) {
        folder.children = this.filterFolderTreeItems(folder.children);
        folder.hasChildFolders = folder.children && folder.children.length > 0;
      }

      return this.folderFilterFn(folder);
    });
  }
}
