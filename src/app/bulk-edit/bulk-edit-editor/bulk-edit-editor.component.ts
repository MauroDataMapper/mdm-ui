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
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueItemDomainType, MultiFacetAwareDomainType, Profile, ProfileContextCollection, ProfileContextIndexResponse, ProfileField, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService, MessageHandlerService } from '@mdm/services';
import { CellClassParams, CellClassRules, CellValueChangedEvent, ColDef, ColGroupDef, ColumnApi, GridApi, GridReadyEvent } from 'ag-grid-community';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditDataRow, BulkEditProfileContext } from '../types/bulk-edit-types';
import { CheckboxCellRendererComponent } from './cell-renderers/checkbox-cell-renderer/checkbox-cell-renderer.component';
import { DateCellEditorComponent } from './cell-editors/date-cell-editor/date-cell-editor.component';

@Component({
  selector: 'mdm-bulk-edit-editor',
  templateUrl: './bulk-edit-editor.component.html',
  styleUrls: ['./bulk-edit-editor.component.scss']
})
export class BulkEditEditorComponent implements OnInit {
  @Input() catalogueItemId: Uuid;
  @Input() domainType: CatalogueItemDomainType | MultiFacetAwareDomainType;

  @Output() backEvent = new EventEmitter<void>();

  /** Two-way binding */
  @Input() tab: BulkEditProfileContext;
  @Output() tabChanged = new EventEmitter();

  /**
   * Register custom components to the grid by name.
   */
  frameworkComponents = {
    checkboxCellRenderer: CheckboxCellRendererComponent,
    dateCellEditor: DateCellEditorComponent
  };

  validated: ProfileContextCollection;
  totalValidationErrors = 0;
  loaded = false;
  columns: ColGroupDef[] = [];
  rows: BulkEditDataRow[] = [];
  cellRules: CellClassRules = {
    'mdm-bulk-edit-editor__invalid': (params) => this.showValidationError(params),
    'mdm-bulk-edit-editor__readonly': (params) => !params.colDef.editable && params.colDef.cellRenderer !== 'checkboxCellRenderer'
  };

  defaultColDef: ColDef = {
    minWidth: 200
  };

  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;

  constructor(
    private messageHandler: MessageHandlerService,
    private resouce: MdmResourcesService,
    private broadcast: BroadcastService) { }

  ngOnInit(): void {
    this.load();

    this.broadcast.on('validateBulkEdit').subscribe(() => {
      this.validate();
    });
  }

  load() {
    this.resouce.profile
      .getMany(
        this.domainType,
        this.catalogueItemId,
        {
          multiFacetAwareItems: this.tab.multiFacetAwareItems,
          profileProviderServices: [{
            name: this.tab.profile.name,
            namespace: this.tab.profile.namespace
          }]
        })
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem loading the profiles.', error);
          return EMPTY;
        })
      )
      .subscribe((response: ProfileContextIndexResponse) => {
        this.tab.editedProfiles = response.body;
        this.columns = this.getColumnsForProfile(response.body.profilesProvided[0].profile);
        this.rows = response.body.profilesProvided.map(profileContext => this.mapProfileToRow(profileContext.profile));

        this.validate();
        this.loaded = true;
      });
  }

  onGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;
    this.screenResize();
  }

  back() {
    this.backEvent.emit();
  }

  onCellValueChanged(event: CellValueChangedEvent) {
    const data = event.data as BulkEditDataRow;
    data.profile.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.metadataPropertyName === event.colDef.field) {
          field.currentValue = event.newValue;
        }
      });
    });
  }

  validate() {
    this.totalValidationErrors = 0;

    this.resouce.profile
      .validateMany(
        this.domainType,
        this.catalogueItemId,
        {
          profilesProvided: this.tab.editedProfiles.profilesProvided
        })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.validated = error.error as ProfileContextCollection;
          this.totalValidationErrors = this.validated.profilesProvided.reduce((current, next) => {
            return current + (next.errors?.total ?? 0);
          }, 0);
          this.gridApi?.redrawRows();
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.validated = null;
        this.gridApi?.redrawRows();
      });
  }

  showValidationError(params: CellClassParams): boolean {
    if (!this.validated) {
      return false;
    }

    const data = params.data as BulkEditDataRow;
    let hasError = false;

    this.validated.profilesProvided.forEach(profileProvided => {
      if (profileProvided.profile.label === data.element && profileProvided.errors) {
        profileProvided.errors.errors.forEach(error => {
          if (error.metadataPropertyName === params.colDef.field) {
            hasError = true;
          }
        });
      }
    });

    return hasError;
  }

  private screenResize() {
    const columnIds = this.gridColumnApi.getAllColumns().map(col => col.getColId());
    this.gridColumnApi.autoSizeColumns(columnIds);
  }

  private getColumnsForProfile(profile: Profile): ColGroupDef[] {
    const elementGroup: ColGroupDef = {
      children: [
        {
          headerName: 'Element',
          field: 'element',
          pinned: 'left'
        }
      ]
    };

    const profileGroups = profile.sections.map(section => {
      return {
        headerName: section.name,
        children: section.fields.map(field => this.getColumnForProfileField(field))
      };
    });

    return [elementGroup, ...profileGroups];
  }

  private getColumnForProfileField(field: ProfileField): ColDef {
    const column: ColDef = {
      headerName: field.fieldName,
      field: field.metadataPropertyName,
      editable: !field.uneditable,
      cellClassRules: this.cellRules
    };

    if (field.dataType === 'boolean') {
      column.cellRenderer = 'checkboxCellRenderer';
      column.editable = false;
      column.cellStyle = { textAlign: 'center' };
    }

    if (field.dataType === 'date') {
      column.cellEditor = 'dateCellEditor';
    }

    if (field.dataType === 'enumeration') {
      column.cellEditor = 'agSelectCellEditor';
      column.cellEditorParams = {
        values: [''].concat(field.allowedValues.sort())};
    }

    return column;
  }

  private mapProfileToRow(profile: Profile): BulkEditDataRow {
    const data = {};
    profile.sections.forEach(section => {
      section.fields.forEach(field => {
        data[field.metadataPropertyName] = field.currentValue;
      });
    });

    return {
      element: profile.label,
      profile,
      ...data
    };
  }
}