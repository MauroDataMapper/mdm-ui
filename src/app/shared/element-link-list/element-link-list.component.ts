import { Component, ViewChildren, ViewChild, Input, ElementRef, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { SemanticLinkHandlerService } from '@mdm/services/handlers/semantic-link-handler.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

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
    private resources: ResourcesService,
    private stateHandler: StateHandlerService,
    private semanticLinkHandler: SemanticLinkHandlerService,
    private changeRef: ChangeDetectorRef,
    private elementSelector: ElementSelectorDialogueService
  ) {}

  @Input() parent: any;
  @Input() searchCriteria: any;
  @Input() type: any;
  @Input() afterSave: any;

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;
  @ViewChildren('filters', { read: ElementRef })
  filters: ElementRef[];
  @ViewChild(MatSort, { static: false })
  sort: MatSort;
  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;

  filterEvent = new EventEmitter<string>();
  hideFilters = true;
  displayedColumns: string[] = ['source', 'link', 'target', 'other'];
  loading: boolean;
  totalItemCount = 0;
  isLoadingResults: boolean;
  filter: string;
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

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          return this.semanticLinkFetch(
            this.paginator.pageSize,
            this.paginator.pageIndex,
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
      )
      .subscribe(data => {
        data.forEach( element => {
         element.status = element.source.id === this.parent.id ? 'source' : 'target';
        });

        this.records = data;
      });
    this.changeRef.detectChanges();
  }

  applyFilter = () => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '') {
        filter += name + '=' + value;
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  semanticLinkFetch = (pageSize, pageIndex, sortBy, sortType, filters) => {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };

    if (this.parent.domainType === 'Term') {
      return this.resources.term.get(
        this.terminology,
        this.parent.id,
        'semanticLinks',
        options
      );
    } else {
      return this.resources.catalogueItem.get(
        this.parent.id,
        'semanticLinks',
        options
      );
    }
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
        sourceDMId: this.parent.dataModel,
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
    this.resources.catalogueItem
      .delete(this.parent.id, 'semanticLinks', record.id)
      .subscribe(
        () => {
          if (this.type === 'static') {
            this.records.splice($index, 1);
            this.messageHandler.showSuccess('Link deleted successfully.');
          } else {
            this.records.splice($index, 1);
            this.messageHandler.showSuccess('Link deleted successfully.');
            this.filterEvent.emit();
          }
        },
        error => {
          this.messageHandler.showError(
            'There was a problem deleting the link.',
            error
          );
        }
      );
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

  onEdit = (record, index) => {};

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
      // resources.catalogueItem.put($scope.parent.id, "semanticLinks", record.id, {resource: resource})

      this.semanticLinkHandler
        .put(this.parent, record.edit.target, record.id, record.edit.linkType)
        .subscribe(res => {
          if (this.afterSave) {
            this.afterSave(resource);
          }

          const result = res.body;
          record.source = result.source;
          record.target = Object.assign({}, result.target);
          record.edit.target = Object.assign({}, result.target);
          record.linkType = result.linkType;
          record.inEdit = false;

          this.messageHandler.showSuccess('Link updated successfully.');
        })
        .catch(function(error) {
          this.messageHandler.showError(
            'There was a problem updating the link.',
            error
          );
        });
    } else {
      // resources.catalogueItem.post($scope.parent.id, "semanticLinks", {resource: resource})
      this.semanticLinkHandler
        .post(this.parent, record.edit.target, record.edit.linkType)
        .subscribe(
          response => {
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
          },
          error => {
            this.messageHandler.showError(
              'There was a problem saving link.',
              error
            );
          }
        );
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

    const dataTypes = this.elementTypes.getAllDataTypesMap();
    if (dataTypes[this.parent.domainType]) {
      domainTypes = ['Term', 'DataType'];
    }

    this.elementSelector
      .open(domainTypes, notAllowedToSelectIds, 'Element Selector', null)
      .afterClosed()
      .subscribe(selectedElement => {
        if (!selectedElement) {
          return;
        }

        record.edit.target = selectedElement;
        // if target has value, then remove any validation error which already exists
        if (
          selectedElement &&
          record.edit.errors &&
          record.edit.errors.target
        ) {
          delete record.edit.errors.target;
        }
      });

    this.changeRef.detectChanges();

    // elementSelectorDialogue.open(domainTypes, notAllowedToSelectIds).then(function (selectedElement) {
    //    if (!selectedElement) {
    //        return;
    //    }
    //    record.edit.target = selectedElement;
    //    //if target has value, then remove any validation error which already exists
    //    if (selectedElement && record.edit.errors && record.edit.errors['target']) {
    //        delete record.edit.errors['target'];
    //    }

    // });
  }
}
