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
import { Component, AfterViewInit, Input, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.sass']
})
export class AnnotationListComponent implements AfterViewInit {
  @Input() parent: any;
  @Input() domainType: any;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  @ViewChild('childEditor', { static: false })

  access: any;
  currentUser: any;
  displayedColumns: string[] = ['lastUpdated'];
  totalItemCount = 0;
  isLoadingResults = true;
  childEditor: MarkdownTextAreaComponent;
  reloadEvent = new EventEmitter<string>();
  records: any[];
  canAddAnnotation = false;

  constructor(
    private securityHandler: SecurityHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private changeRef: ChangeDetectorRef,
    private editingService: EditingService) { }


  set content(content: MarkdownTextAreaComponent) {
    this.childEditor = content;
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.reloadEvent.subscribe(() => (this.paginator.pageIndex = 0));

    this.access = this.securityHandler.elementAccess(this.parent);
    this.canAddAnnotation = this.access.canAddAnnotation;
    this.changeRef.detectChanges();
    this.currentUser = this.securityHandler.getCurrentUser();

    merge(this.sort.sortChange, this.paginator.page, this.reloadEvent).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      this.changeRef.detectChanges();

      return this.annotationFetch();
    }), map((data: any) => {
      this.totalItemCount = data.body.count;
      this.isLoadingResults = false;
      this.changeRef.detectChanges();
      return data.body.items;
    }), catchError(() => {
      this.isLoadingResults = false;
      return [];
    })
    ).subscribe(data => {
      this.records = data;
    });

    this.changeRef.detectChanges();
  }

  // annotationFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {
  // const options = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType, filters);
  annotationFetch() {
    return this.resources.catalogueItem.listAnnotations(this.domainType, this.parent.id);
  }

  add = () => {
    const newRecord = {
      id: '',
      label: '',
      description: '',
      createdBy: {
        firstName: '',
        lastName: '',
        organisation: '',
        emailAddress: ''
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
  };

  cancelEdit(record, index) {
    if (!this.editingService.confirmCancel()) {
      return;
    }

    if (record.isNew) {
      this.records.splice(index, 1);
      this.records = [].concat(this.records);
    }

    this.editingService.setFromCollection(this.records);
  };

  saveParent = (record) => {
    const resource = {
      label: record.edit.label,
      description: record.edit.description
    };
    this.resources.catalogueItem.saveAnnotations(this.domainType, this.parent.id, resource).subscribe(() => {
      record.inEdit = false;
      this.editingService.setFromCollection(this.records);
      this.messageHandler.showSuccess('Comment saved successfully.');
      this.reloadEvent.emit();
    }, error => {
      this.messageHandler.showError('There was a problem adding the comment.', error);
    });
  };

  addChild = annotation => {
    const resource = {
      description: annotation.newChildText
    };

    this.resources.catalogueItem.saveAnnotationChildren(this.domainType, this.parent.id, annotation.id, resource).toPromise().then(response => {
      annotation.childAnnotations = annotation.childAnnotations || [];
      annotation.childAnnotations.push(response.body);
      annotation.newChildText = '';
      this.messageHandler.showSuccess('Comment saved successfully.');
    }, error => {
      this.messageHandler.showError('There was a problem saving the comment.', error);
      // element not found
      if (error.status === 400) {
        // viewError
      }
    }
    );
  };

  showChildren = annotation => {
    if (annotation.show) {
      annotation.show = false;
    } else {
      annotation.newChildText = '';
      annotation.show = true;
    }
  };
}
