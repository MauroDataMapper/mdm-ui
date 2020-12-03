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
  @Output() checkChange = new EventEmitter<any>();
  @Output() ngModelChange = new EventEmitter<any>();
  @ViewChild('searchInputTreeControl', { static: true })
  searchInputTreeControl: ElementRef;
  selectedElementsVal: any;
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
  selectedElements: any[] = [];
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
        this.resources.tree.search('folders', this.searchCriteria, options).subscribe((result) => {
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
            const label = this.selectedElements[0] ? this.selectedElements[0].label : '';
            if (this.selectedElements && text.trim().toLowerCase() === label.trim().toLowerCase() && label.trim().toLowerCase() !== '') {
              return;
            }
          }
        }
        if (this.searchCriteria.trim().length > 0) {
          this.inSearchMode = true;
          this.resources.tree.search('folders', this.searchCriteria).subscribe((result) => {
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
      this.resources.folder.get(id).subscribe(data => {
        this.loading = false;
        this.rootNode = {
          children: data.body.items,
          isRoot: true
        };
        this.filteredRootNode = this.rootNode;
      }, () => {
        this.loading = false;
      });
    } else {
      this.resources.tree.list('folders', {foldersOnly: true}).subscribe(data => {
        this.loading = false;
        this.rootNode = {
          children: data.body,
          isRoot: true
        };
        this.filteredRootNode = this.rootNode;
      }, () => {
        this.loading = false;
      });
    }
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

    let method = this.resources.tree.list('folders', options);


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


  onNodeClick = (node) => {
    this.click(node);
  };

  onNodeDbClick = (node) => {
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

      if (this.alwaysShowTree) {
        this.showTree = true;
      } else {
        this.showTree = false;
      }
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

  // TODO
  onAddFolder = () => { };
}
