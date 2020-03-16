import { Component, AfterViewInit, Input, ViewChild, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { SecurityHandlerService } from '../../services/handlers/security-handler.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { merge, Observable, BehaviorSubject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MarkdownTextAreaComponent } from '../../utility/markdown-text-area.component';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'mdm-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.sass']
})
export class AnnotationListComponent implements AfterViewInit {
  constructor(
    private securityHandler: SecurityHandlerService,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private changeRef: ChangeDetectorRef
  ) {}

  @Input() parent: any;

  access: any;
  currentUser: any;
  displayedColumns: string[] = ['lastUpdated'];
  totalItemCount: number;
  isLoadingResults: boolean;
  childEditor: MarkdownTextAreaComponent;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild('childEditor', { static: false })
  set content(content: MarkdownTextAreaComponent) {
    this.childEditor = content;
  }

  reloadEvent = new EventEmitter<string>();

  records: any[];

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.reloadEvent.subscribe(() => (this.paginator.pageIndex = 0));

    this.access = this.securityHandler.elementAccess(this.parent);
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
            this.paginator.pageIndex,
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
          // this.changeRef.detectChanges();
          return [];
        })
      )
      .subscribe(data => {
        this.records = data;
      });

    this.changeRef.detectChanges();
  }

  annotationFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {
    const options = {
      pageSize,
      pageIndex,
      sortBy,
      sortType,
      filters
    };
    return this.resources.facets.get(this.parent.id, 'annotations', options);
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
  };

  cancelEdit = (record, index) => {
    if (record.isNew) {
      this.records.splice(index, 1);
    }
  };

  saveParent = (record, index) => {
    const resource = {
      label: record.edit.label,
      description: record.edit.description
    };
    this.resources.facets
      .post(this.parent.id, 'annotations', { resource })
      .subscribe(
        result => {
          this.messageHandler.showSuccess('Comment saved successfully.');
          this.reloadEvent.emit();
        },
        error => {
          this.messageHandler.showError(
            'There was a problem adding the comment.',
            error
          );
        }
      );
  };

  addChild = annotation => {
    const resource = {
      description: annotation.newChildText
    };

    this.resources.facets
      .post(this.parent.id, 'annotations/' + annotation.id + '/annotations', {
        resource
      })
      .toPromise()
      .then(
        response => {
          annotation.childAnnotations = annotation.childAnnotations || [];
          annotation.childAnnotations.push(response.body);
          annotation.newChildText = '';
          this.messageHandler.showSuccess('Comment saved successfully.');
        },
        error => {
          this.messageHandler.showError(
            'There was a problem saving the comment.',
            error
          );
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
  }
}
