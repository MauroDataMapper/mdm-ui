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
import { Component, ViewChildren, ViewChild, Input, ElementRef, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { SemanticLinkHandlerService } from '@mdm/services/handlers/semantic-link-handler.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { GridService } from '@mdm/services/grid.service';

@Component({
  selector: 'mdm-element-link-list',
  templateUrl: './element-link-list.component.html',
  styleUrls: ['./element-link-list.component.sass']
})
export class ElementLinkListComponent implements AfterViewInit {
  constructor(
    public elementTypes: ElementTypesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private resources: MdmResourcesService,
    private stateHandler: StateHandlerService,
    private semanticLinkHandler: SemanticLinkHandlerService,
    private changeRef: ChangeDetectorRef,
    private elementSelector: ElementSelectorDialogueService,
    private gridService: GridService
  ) { }

  @Input() parent: any;
  @Input() searchCriteria: any;
  @Input() type: any;
  @Input() afterSave: any;
  @Input() domainType: any;

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  @ViewChildren('filters', { read: ElementRef })
  filters: ElementRef[];
  @ViewChild(MatSort, { static: false })
  sort: MatSort;
  // @ViewChild(MatPaginator, { static: false })
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  // paginator: MatPaginator;

  filterEvent = new EventEmitter<any>();
  filter: {};
  hideFilters = true;
  displayedColumns: string[] = ['source', 'link', 'target', 'other'];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults = true;
  clientSide: boolean;

  semanticLinkTypes: any[];
  showLinkSuggestion: boolean;

  terminology: any;

  records: any[] = [];

  access: any;

  ngAfterViewInit() {
    this.access = this.securityHandler.elementAccess(this.parent);
    this.semanticLinkTypes = this.elementTypes.getSemanticLinkTypes();
    this.handleShowLinkSuggestion(this.parent);

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;

      return this.semanticLinkFetch(
        this.paginator.pageSize,
        this.paginator.pageOffset,
        this.sort.active,
        this.sort.direction,
        this.filter
      );
    }),
      map((data: any) => {
        this.totalItemCount = data.body.count;
        this.isLoadingResults = false;
        return data.body.items;
      }),
      catchError(() => {
        this.isLoadingResults = false;
        return [];
      })
    ).subscribe(data => {
      data.forEach(element => {
        element.status = element.sourceCatalogueItem.id === this.parent.id ? 'source' : 'target';
      });

      this.records = data;
    });
    this.changeRef.detectChanges();
  }

  applyFilter = () => {
    const filter = {};
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
       filter[name] = value;
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  semanticLinkFetch = (pageSize, pageIndex, sortBy, sortType, filters) => {
    const options = this.gridService.constructOptions(pageSize,pageIndex,sortBy,sortType,filters);

    return this.resources.catalogueItem.listSemanticLinks(this.domainType, this.parent.id, options);

    // if (this.parent.domainType === 'Term') {
    //   return this.resources.term.get(
    //     this.terminology,
    //     this.parent.id,
    //     'semanticLinks',
    //     options
    //   );
    // } else {
    //   return this.resources.catalogueItem.get(
    //     this.parent.id,
    //     'semanticLinks',
    //     options
    //   );
    // }
  };

  handleShowLinkSuggestion = element => {
    if (['DataModel', 'DataElement'].indexOf(element.domainType) !== -1) {
      this.showLinkSuggestion = true;
    }
  };

  linkSuggestion = () => {
    let params = {};

    if (this.parent.domainType === 'DataModel') {
      params = {
        sourceDMId: this.parent.id
      };
    }
    if (this.parent.domainType === 'DataElement') {
      params = {
        sourceDEId: this.parent.id,
        sourceDMId: this.parent.model,
        sourceDCId: this.parent.dataClass
      };
    }
    this.stateHandler.NewWindow('linkSuggestion', params, null);
  };

  delete = (record, $index) => {
    if (this.clientSide) {
      this.records.splice($index, 0);
      return;
    }
    this.resources.catalogueItem.removeSemanticLink(this.parent.domainType, this.parent.id, record.id).subscribe(() => {
      if (this.type === 'static') {
        this.records.splice($index, 1);
        this.messageHandler.showSuccess('Link deleted successfully.');
      } else {
        this.records.splice($index, 1);
        this.messageHandler.showSuccess('Link deleted successfully.');
        this.filterEvent.emit();
      }
    }, error => {
      this.messageHandler.showError('There was a problem deleting the link.', error);
    });
  };

  add = () => {
    const newRecord = {
      id: '',
      source: this.parent,
      target: null,
      linkType: 'Refines',
      status: 'source',
      edit: {
        id: '',
        source: this.parent,
        target: null,
        linkType: 'Refines',
        status: 'source'
      },
      inEdit: true,
      isNew: true
    };

    this.records = [].concat([newRecord]).concat(this.records);
    return;
  };

  onEdit = (record, index) => { };

  cancelEdit = (record, index) => {
    if (record.isNew) {
      this.records.splice(index, 1);
      this.table.renderRows();
    }
  };

  validate = (record, index) => {
    let isValid = true;
    record.edit.errors = [];

    if (this.type === 'static') {
    } else if (!record.edit.target) {
      record.edit.errors.target = 'Target can\'t be empty!';
      isValid = false;
    }
    return isValid;
  };

  save = (record, index) => {
    if (this.clientSide) {
      return;
    }

    const resource = {
      target: { id: record.edit.target.id },
      linkType: record.edit.linkType
    };

    // in edit mode, we save them here
    if (record.id && record.id !== '') {
      const body = {
        targetCatalogueItemDomainType: `${record.edit.target.domainType}`,
        targetCatalogueItemId: `${record.edit.target.id}`,
        domainType: 'SemanticLink',
        linkType: record.edit.linkType,
      };

      this.resources.catalogueItem.updateSemanticLink(this.domainType, this.parent.id, record.id, body).subscribe(res => {
        if (this.afterSave) {
          this.afterSave(resource);
        }
        // this.filterEvent.emit();

        // const result = res.body;
        // record.source = result.source;
        // record.target = Object.assign({}, result.target);
        // record.edit.target = Object.assign({}, result.target);
        // record.linkType = result.linkType;
        record.inEdit = false;
        this.table.renderRows();

        this.messageHandler.showSuccess('Link updated successfully.');
      }, err => {
        this.messageHandler.showError('There was a problem updating the link.', err);
      });
    } else {
      const body = {
        targetCatalogueItemDomainType: `${record.edit.target.domainType}`,
        targetCatalogueItemId: `${record.edit.target.id}`,
        domainType: 'SemanticLink',
        linkType: record.edit.linkType,
      };

      this.resources.catalogueItem.saveSemanticLinks(this.domainType, this.parent.id, body).subscribe(response => {
        record = Object.assign({}, response);
        record.status = 'source';

        if (this.type === 'static') {
          this.records[index] = record;
          this.messageHandler.showSuccess('Link saved successfully.');
        } else {
          this.records[index] = record;
          this.messageHandler.showSuccess('Link saved successfully.');
          this.filterEvent.emit();
        }
      }, error => {
        this.messageHandler.showError('There was a problem saving link.', error);
      });
    }
  };

  findElement = record => {
    let domainTypes = [];
    const notAllowedToSelectIds = [this.parent.id];

    if (this.parent.domainType === 'DataModel') {
      domainTypes = ['DataModel', 'DataClass'];
    }

    if (this.parent.domainType === 'DataClass') {
      domainTypes = ['DataModel', 'DataClass'];
    }

    if (this.parent.domainType === 'DataElement') {
      domainTypes = ['DataElement', 'Term'];
    }

    if (this.parent.domainType === 'Term') {
      domainTypes = ['DataElement', 'Term', 'DataType'];
      notAllowedToSelectIds.push(this.parent.terminology);
    }

    if (this.parent.domainType === 'CodeSet') {
      domainTypes = ['DataModel', 'DataClass', 'DataElement', 'DataType', 'Term'];
    }

    const dataTypes = this.elementTypes.getAllDataTypesMap();
    if (dataTypes[this.parent.domainType]) {
      domainTypes = ['Term', 'DataType'];
    }

    this.elementSelector.open(domainTypes, notAllowedToSelectIds, 'Element Selector', null).afterClosed().subscribe(selectedElement => {
      if (!selectedElement) {
        return;
      }
      record.edit.target = selectedElement;
      // if target has value, then remove any validation error which already exists
      if (selectedElement && record.edit.errors && record.edit.errors.target) {
        delete record.edit.errors.target;
      }
    });
    this.changeRef.detectChanges();
  }
}
