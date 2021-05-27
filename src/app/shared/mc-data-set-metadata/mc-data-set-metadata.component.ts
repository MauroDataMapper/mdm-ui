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
  AfterViewInit,
  Input,
  ViewChild,
  ViewChildren,
  QueryList,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatInput } from '@angular/material/input';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { GridService } from '@mdm/services/grid.service';
import { EditingService } from '@mdm/services/editing.service';
import { Access } from '@mdm/model/access';

@Component({
  selector: 'mdm-data-set-metadata',
  templateUrl: './mc-data-set-metadata.component.html',
  styleUrls: ['./mc-data-set-metadata.component.scss'],
})
export class McDataSetMetadataComponent implements AfterViewInit {
  @Input() parent: any;
  @Input() type: 'static' | 'dynamic';
  @Input() metaDataItems: any;
  @Input() loadingData: any;
  @Input() clientSide: any;
  @Input() afterSave: any;
  @Input() domainType: any;
  @Input() isProfileView = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  @ViewChildren('filters') filters: QueryList<MatInput>;

  namespaces: any[];
  metadataKeys: any[];
  access: Access;
  loading = false;
  records: any[];
  metadata: any;
  displayedColumns: string[] = ['namespace', 'key', 'value', 'btns'];
  hideFilters = true;
  totalItemCount = 0;
  isLoadingResults = true;
  filterEvent = new EventEmitter<any>();
  filter: {};

  constructor(
    private resources: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private changeDetectorRefs: ChangeDetectorRef,
    private gridService: GridService,
    private editingService: EditingService
  ) { }

  ngAfterViewInit() {
    if (this.parent) {
      this.namespaces = [];
      this.metadataKeys = [];
      this.records = [];
      this.access = this.securityHandler.elementAccess(this.parent);
      this.changeDetectorRefs.detectChanges();

      if (this.type === 'dynamic') {
        this.loadNamespaces();

        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
        this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
          .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;
              this.changeDetectorRefs.detectChanges();
              return this.metadataFetch(
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
              this.changeDetectorRefs.detectChanges();
              return data.body.items;
            }),
            catchError((error) => {
              this.isLoadingResults = false;
              this.changeDetectorRefs.detectChanges();
              this.messageHandler.showError('There was a problem loading the metadata.', error);
              return [];
            })
          )
          .subscribe((data) => {
            this.records = data;
          });
      }

      if (this.type === 'static') {
        this.loading = true;
        this.loadNamespaces();
        this.loadingData.onChange((newValue) => {
          if (newValue !== null && newValue !== undefined) {
            this.loading = newValue;
          }
        });
        this.metaDataItems.onChange((newValue) => {
          if (newValue !== null && newValue !== undefined) {
            this.showRecords();
          }
        });
      }
    }
  }

  loadNamespaces() {
    this.resources.metadata
      .namespaces()
      .pipe(
        map((response: any) => response.body.filter((n) => n.defaultNamespace === false))
      )
      .subscribe(
        data => this.namespaces = data,
        errors => this.messageHandler.showError('There was a problem getting the namespace list.', errors));
  }

  metadataFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {
    const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);
    if(this.isProfileView) {
      return this.resources.profile.otherMetadata(this.domainType, this.parent.id, options);
    } else {
      return this.resources.catalogueItem.listMetadata(this.domainType, this.parent.id, options);
    }
  }

  applyFilter = () => {
    const filter = {};
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;
      if (value !== '') {
        if (name === 'namespace') {
          filter['ns'] = value;
        } else {
          filter[name] = value;
        }
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  onNamespaceSelect(select, record) {
    if (select) {
      record.edit.namespace = select.namespace;
      record.metadataKeys = [];
      // now fill the 'metadataKeys'
      for (const namespace of this.namespaces) {
        if (namespace.namespace === select.namespace) {
          record.metadataKeys = namespace.keys;
          // create object for the keys as mcSelect2 expects objects with id
          let id = 0;
          record.metadataKeys = namespace.keys.map((key) => {
            return { id: id++, key };
          });
          break;
        }
      }
    } else {
      record.edit.namespace = '';
      record.metadataKeys = [];
    }
  }

  onKeySelect(select, record) {
    if (select) {
      record.edit.key = select.key;
    } else {
      record.edit.key = '';
    }
  }

  onEdit(record) {
    this.editingService.setFromCollection(this.records);
    // now fill the 'metadataKeys'
    for (const namespace of this.namespaces) {
      if (namespace.namespace === record.namespace) {
        record.metadataKeys = namespace.metadataKeys;
        break;
      }
    }
  }

  showRecords() {
    if (this.metadata) {
      this.records = [].concat(this.metadata);
    }
  }

  validate = (record, index) => {
    let isValid = true;

    record.edit.errors = [];

    if (this.type === 'static') {
      if (record.edit.key.trim().length === 0) {
        record.edit.errors.key = 'Key can\'t be empty!';
        isValid = false;
      }
      if (record.edit.value.trim().length === 0) {
        record.edit.errors.value = 'Value can\'t be empty!';
        isValid = false;
      }
      for (let i = 0; i < this.records.length; i++) {
        if (i === index) {
          continue;
        }
        if (
          this.records[i].key.toLowerCase().trim() ===
          record.edit.key.toLowerCase().trim() &&
          this.records[i].namespace.toLowerCase().trim() ===
          record.edit.namespace.toLowerCase().trim()
        ) {
          record.edit.errors.key = 'Key already exists';
          isValid = false;
        }
      }
      if (isValid) {
        delete record.edit.errors;
      }
    } else {
      if (record.edit.key.trim().length === 0) {
        record.edit.errors.key = 'Key can\'t be empty!';
        isValid = false;
      }
      if (record.edit.value.trim().length === 0) {
        record.edit.errors.value = 'Value can\'t be empty!';
        isValid = false;
      }
      // Call a backend service and see if it's duplicate
    }
    return isValid;
  };

  add() {
    const newRecord = {
      id: '',
      namespace: '',
      key: '',
      value: '',
      edit: {
        id: '',
        namespace: '',
        key: '',
        value: '',
      },
      inEdit: true,
      isNew: true,
    };
    this.records = [].concat([newRecord]).concat(this.records);

    this.editingService.setFromCollection(this.records);
  }

  cancelEdit(record, index) {
    if (record.isNew) {
      this.records.splice(index, 1);
      this.records = [].concat(this.records);
    }

    this.editingService.setFromCollection(this.records);
  }

  save(record, index) {
    const resource = {
      key: record.edit.key,
      value: record.edit.value,
      namespace: record.edit.namespace,
    };

    // if clientSide is true, it should not pass details to the server
    // this is used in wizard for adding metadata items when creating a new model,class or element
    if (this.clientSide) {
      record.namespace = resource.namespace;
      record.key = resource.key;
      record.value = resource.value;
      record.inEdit = false;
      record.isNew = false;
      this.records[index] = record;
      this.metaDataItems = this.records;
      return;
    }

    // in edit mode, we save them here
    if (record.id && record.id !== '') {
      this.resources.catalogueItem.updateMetadata(this.domainType, this.parent.id, record.id, resource).subscribe(() => {
        if (this.afterSave) {
          this.afterSave(resource);
        }

        record.namespace = resource.namespace;
        record.key = resource.key;
        record.value = resource.value;
        record.inEdit = false;
        this.editingService.setFromCollection(this.records);
        this.messageHandler.showSuccess('Property updated successfully.');
      }, (error) => {
        // duplicate namespace + key
        if (error.status === 422) {
          record.edit.errors = [];
          record.edit.errors.key = 'Key already exists';
          return;
        }
        this.messageHandler.showError('There was a problem updating the property.', error);
      }
      );
    } else {
      this.resources.catalogueItem.saveMetadata(this.domainType, this.parent.id, resource).subscribe((response) => {
        // after successfully saving the row, it if is a new row,then remove its newRow property
        record.id = response.body.id;
        record.namespace = response.body.namespace;
        record.key = response.body.key;
        record.value = response.body.value;
        record.inEdit = false;
        this.editingService.setFromCollection(this.records);
        delete record.edit;

        if (this.type === 'static') {
          this.records[index] = record;
          this.messageHandler.showSuccess('Property saved successfully.');
        } else {
          this.records[index] = record;
          this.messageHandler.showSuccess('Property saved successfully.');
          this.filterEvent.emit();
        }
      }, (error) => {
        // duplicate namespace + key
        if (error.status === 422) {
          record.edit.errors = [];
          record.edit.errors.key = 'Key already exists';
          return;
        }
        this.messageHandler.showError('There was a problem saving property.', error);
      });
    }
  }

  delete(record, $index) {
    if (this.clientSide) {
      this.records.splice($index, 1);
      this.metaDataItems = this.records;
      return;
    }
    this.resources.catalogueItem.removeMetadata(this.domainType, this.parent.id, record.id).subscribe(() => {
      if (this.type === 'static') {
        this.records.splice($index, 1);
        this.messageHandler.showSuccess('Property deleted successfully.');
      } else {
        this.records.splice($index, 1);
        this.messageHandler.showSuccess('Property deleted successfully.');
        this.filterEvent.emit();
      }
    },
      (error) => {
        this.messageHandler.showError('There was a problem deleting the property.', error);
      });
  }

  filterClick() {
    this.hideFilters = !this.hideFilters;
  }
}
