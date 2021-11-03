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
import { Component, AfterViewInit, Input, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { EMPTY, merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { EditingService } from '@mdm/services/editing.service';
import { GridService } from '@mdm/services';
import { CatalogueItem, ModelDomainType, Securable } from '@maurodatamapper/mdm-resources';
import { UserDetails } from '@mdm/services/handlers/security-handler.model';

@Component({
  selector: 'mdm-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.sass']
})
export class AnnotationListComponent implements AfterViewInit {
  @Input() parent: CatalogueItem & Securable;
  @Input() domainType: ModelDomainType;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  currentUser: UserDetails;
  displayedColumns: string[] = ['lastUpdated'];
  totalItemCount = 0;
  isLoadingResults = true;
  reloadEvent = new EventEmitter<void>();
  records: any[];
  canAddAnnotation = false;

  constructor(
    private securityHandler: SecurityHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private changeRef: ChangeDetectorRef,
    private editingService: EditingService,
    private gridService: GridService) { }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.reloadEvent.subscribe(() => (this.paginator.pageIndex = 0));
    this.canAddAnnotation = this.parent.availableActions.includes('comment');
    this.changeRef.detectChanges();
    this.currentUser = this.securityHandler.getCurrentUser();

    merge(this.sort.sortChange, this.paginator.page, this.reloadEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.changeRef.detectChanges();

          return this.annotationFetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction
          );
        }),
        map((data: any) => {
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          this.changeRef.detectChanges();
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return EMPTY;
        })
      )
      .subscribe(data => {
        this.records = data;
      });
  }

  annotationFetch(
    pageSize?: number,
    pageIndex?: number,
    sortBy?: string,
    sortType?: string,): Observable<any> {
    const options = this.gridService.constructOptions(
      pageSize,
      pageIndex,
      sortBy,
      sortType);

    return this.resources.catalogueItem.listAnnotations(
      this.domainType,
      this.parent.id,
      options);
  }

  add() {
    const newRecord = {
      id: '',
      label: '',
      description: '',
      createdByUser: {
        name: ''
      },
      edit: {
        id: '',
        label: '',
        description: ''
      },
      inEdit: true,
      isNew: true
    };

    this.records = [].concat([newRecord]).concat(this.records);
    this.editingService.setFromCollection(this.records);
  }

  cancelEdit(record: any, index: number) {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (!confirm) {
        return;
      }

      if (record.isNew) {
        this.records.splice(index, 1);
        this.records = [].concat(this.records);
      }

      this.editingService.setFromCollection(this.records);
    });
  }

  saveParent(record: any) {
    const resource = {
      label: record.edit.label,
      description: record.edit.description
    };

    this.resources.catalogueItem
      .saveAnnotations(this.domainType, this.parent.id, resource)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem adding the comment.', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        record.inEdit = false;
        this.editingService.setFromCollection(this.records);
        this.messageHandler.showSuccess('Comment saved successfully.');
        this.reloadEvent.emit();
      });
  }

  addChild(annotation: any) {
    const resource = {
      description: annotation.newChildText
    };

    this.resources.catalogueItem
      .saveAnnotationChildren(this.domainType, this.parent.id, annotation.id, resource)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem saving the comment.', error);
          return EMPTY;
        })
      )
      .subscribe(response => {
        annotation.childAnnotations = annotation.childAnnotations || [];
        annotation.childAnnotations.push(response.body);
        annotation.newChildText = '';
        this.messageHandler.showSuccess('Comment saved successfully.');
      });
  }

  showChildren(annotation: any) {
    if (annotation.show) {
      annotation.show = false;
    }
    else {
      annotation.newChildText = '';
      annotation.show = true;
    }
  }
}
