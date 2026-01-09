/*
Copyright 2020-2025 University of Oxford and NHS England

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
import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementTypesService, MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { Title } from '@angular/platform-browser';
import { StateService } from '@uirouter/core';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { Finalisable, Securable } from '@maurodatamapper/mdm-resources';
import { MdmPaginatorComponent as MdmPaginatorComponent_1 } from '../shared/mdm-paginator/mdm-paginator';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { FormsModule } from '@angular/forms';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'mdm-link-suggestion',
    templateUrl: './link-suggestion.component.html',
    styleUrls: ['./link-suggestion.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        ModelSelectorTreeComponent,
        FormsModule,
        ElementLinkComponent,
        ModelPathComponent,
        MatCheckbox,
        MatButton,
        MatProgressBar,
        MatTooltip,
        MatTable,
        MatSort,
        MatColumnDef,
        MatHeaderCellDef,
        MatHeaderCell,
        MatSortHeader,
        MatCellDef,
        MatCell,
        McSelectComponent,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        MdmPaginatorComponent_1,
    ],
})
export class LinkSuggestionComponent implements OnInit {
  @Input() sourceDataElementId: any;
  @Input() sourceDataClassId: any;
  @Input() sourceDataModelId: any;
  @Input() targetDataModelId: any;

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];

  @ViewChild(MatTable) table: MatTable<any>;
  datasource = new MatTableDataSource();
  doNotSuggest: any;

  model = {
    source: null,
    sourceLink: null,
    loadingSource: false,
    target: null,
    targetLink: null,
    loadingTarget: false,
    suggestions: [],
    processing: false,
    sourceEditable: true,
    successfullyAdded: 0,
    totalSuggestionLinks: 0,
    totalIgnoredLinks: 0,
  };

  displayedColumns = ['source', 'target', 'buttons'];
  hideFilters: boolean;

  constructor(
    private securityHandler: SecurityHandlerService,
    private elementTypes: ElementTypesService,
    private resources: MdmResourcesService,
    private title: Title,
    private state: StateService,
    private messageHandler: MessageHandlerService
  ) { }

  ngOnInit() {
    this.title.setTitle('Link Suggestion');
    this.hideFilters = true;

    this.sourceDataModelId = this.sourceDataModelId ? this.sourceDataModelId : this.state.params.sourceDMId;
    this.sourceDataElementId = this.sourceDataElementId ? this.sourceDataElementId : this.state.params.sourceDEId;
    this.sourceDataClassId = this.sourceDataClassId ? this.sourceDataClassId : this.state.params.sourceDCId;
    this.targetDataModelId = this.targetDataModelId ? this.targetDataModelId : this.state.params.targetDMId;

    if (this.sourceDataElementId) {
      this.setSourceDataElement(this.sourceDataModelId as string, this.sourceDataClassId as string, this.sourceDataElementId as string);
    }
 else if (this.sourceDataModelId) {
      this.setSourceDataModel([{ id: this.sourceDataModelId }]);
    }

    if (this.targetDataModelId) {
      this.setTargetDataModel([{ id: this.targetDataModelId }]);
    }
  }

  onSourceSelect = (dataModels) => {
    this.model.suggestions = [];
    this.setSourceDataModel(dataModels);
  };

  setSourceDataModel = (dataModels) => {
    if (dataModels && dataModels.length > 0) {
      this.model.loadingSource = true;
      this.resources.dataModel.get(dataModels[0].id as string).subscribe((result) => {
        this.model.source = result.body;
        this.model.sourceLink = this.elementTypes.getLinkUrl(this.model.source);
        const access = this.securityHandler.elementAccess(this.model.source as Securable | (Securable & Finalisable));
        this.model.sourceEditable = access.showEdit;
        this.model.loadingSource = false;
      });
    }
 else {
      this.model.sourceLink = null;
      this.model.source = null;
      this.model.sourceEditable = true;
    }
  };

  setSourceDataElement = (sourceDMId: string, sourceDCId: string, sourceDEId: string) => {
    this.model.loadingSource = true;
    this.resources.dataElement.get(sourceDMId, sourceDCId, sourceDEId).subscribe((result) => {
      this.model.source = result.body;
      this.model.sourceLink = this.elementTypes.getLinkUrl(this.model.source);
      const access = this.securityHandler.elementAccess(this.model.source as Securable | (Securable & Finalisable));
      this.model.sourceEditable = access.showEdit;
      this.model.loadingSource = false;
    });
  };

  onTargetSelect = (dataModels) => {
    this.model.suggestions = [];
    this.setTargetDataModel(dataModels);
  };

  setTargetDataModel = (dataModels) => {
    if (dataModels && dataModels.length > 0) {
      this.model.loadingTarget = true;
      this.resources.dataModel.get(dataModels[0].id as string).subscribe((result) => {
        this.model.target = result.body;
        this.model.targetLink = this.elementTypes.getLinkUrl(this.model.target);
        this.model.loadingTarget = false;
      });
    }
 else {
      this.model.targetLink = null;
      this.model.target = null;
    }
  };

  onTargetDateElementSelect = (suggestion, record) => {
    record.selectedTarget = suggestion;
    record.showMore = null;
  };

  approveSuggestion = (suggest) => {
    const resource = {
      target: { id: suggest.selectedTarget.dataElement.id },
      linkType: 'Refines',
    };

    const i = this.model.suggestions.indexOf(suggest);

    if (i >= 0) {
      this.model.suggestions[i].processing = true;
      // create the link and then remove it
      this.resources.catalogueItem.saveSemanticLinks(this.model.source.domainType as string, this.model.source.id as string, resource).subscribe(() => {
        this.model.suggestions[i].processing = false;
        this.model.suggestions[i].success = true;
        this.model.successfullyAdded++;
        setTimeout(() => {
          this.model.suggestions.splice(i, 1);
          this.table.renderRows();
        }, 300);
      }, (error) => {
        this.model.suggestions[i].processing = false;
        this.model.suggestions[i].success = false;
        this.messageHandler.showError('There was a problem saving link.', error);
      });
    }
  };

  ignoreSuggestion = (record) => {
    const index = this.model.suggestions.indexOf(record);

    if (index >= 0) {
      this.model.suggestions[index].ignore = true;
      this.model.suggestions.splice(index, 1);
      this.datasource.data = this.model.suggestions;
      this.table.renderRows();
      this.model.totalIgnoredLinks++;
      this.model.totalSuggestionLinks--;
    }
  };

  toggleShowMore = (suggestion) => {
    suggestion.showMore = !suggestion.showMore;
  };

  suggest = () => {
    this.model.processing = true;

    this.model.successfullyAdded = 0;
    this.model.totalSuggestionLinks = 0;
    this.model.totalIgnoredLinks = 0;

    if (this.model.source.domainType === 'DataModel') {
      this.resources.dataModel.suggestLinks(this.model.source.id as string, this.model.target.id as string).subscribe((result) => {
        const data = result.body;
        if (data.links) {
          this.model.suggestions = data.links;
          this.model.totalSuggestionLinks = data.links.length;
          this.model.suggestions.forEach((suggestion) => {
            suggestion.selectedTarget = suggestion.results[0];
          });
          this.datasource.data = data.links;
          this.datasource.paginator = this.paginator;
          this.datasource.sort = this.sort;
        }
        this.model.processing = false;
      }, () => {
        this.model.processing = false;
      });
    }
 else if (this.model.source.domainType === 'DataElement') {
      this.resources.dataElement.suggestLinks(this.model.source.model as string, this.model.source.dataClass as string, this.model.source.id as string, this.model.target.id as string).subscribe((data) => {
        if (data.body) {
          this.model.suggestions = [data.body];
          this.model.totalSuggestionLinks = 1;
          this.model.suggestions[0].selectedTarget = this.model.suggestions[0].results[0];
          this.datasource.data = [data.body];
          this.datasource.paginator = this.paginator;
          this.datasource.sort = this.sort;
        }
        this.model.processing = false;
      }, () => {
        this.model.processing = false;
      });
    }
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };
}
