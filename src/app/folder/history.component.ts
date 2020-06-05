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
import {AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { ResourcesService } from '../services/resources.service';
import { SearchResult } from '../model/folderModel';
import { ElementTypesService } from '../services/element-types.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {merge} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {MdmPaginatorComponent} from '../shared/mdm-paginator/mdm-paginator';
import {GridService} from '../services/grid.service';
import {McSelectPagination} from '../utility/mc-select/mc-select.component';

@Component({
    selector: 'mdm-history',
    templateUrl: './history.component.html',
    // styleUrls: ['./history.component.sass']
})

export class HistoryComponent implements OnInit, AfterViewInit {

    public result: SearchResult;
    public dataSetResult: any[];
    displayedColumns: string[] = ['createdBy', 'dateCreated', 'description'];
    totalItemCount = 0;
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
   @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
    options;
    elementMap: any[];
    @Input() parent: any;
    @Input() parentType: string;
    @Input() parentId: string;
    parentVal;
    parentTypeVal;
    parentIdVal;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
   // dataSource = new MatTableDataSource();
   // isLoading = false;
 // pagination: McSelectPagination;
  isLoadingResults = true;

  records: any[] = [];
  filter: any = '';
  applyFilter = this.gridService.applyFilter(this.filters);

  constructor(public resourcesService: ResourcesService,  private gridService: GridService, private elementTypeService: ElementTypesService) {

    }

    public getServerData($event) {
        // var offset = $event.pageIndex * $event.pageSize;
        this.fetch($event.pageSize, $event.pageIndex, $event.pageIndex, this.sort.active, this.sort.direction);
    }

    public getSortedData($event) {
        this.fetch(this.paginator.pageSize, this.paginator.pageIndex, this.paginator.pageIndex, $event.active, $event.direction);
    }

    ngOnInit() {
        this.parentTypeVal = this.parentType;
        this.parentIdVal = this.parentId ? this.parentId : this.parent.id;
        this.parentVal = this.parent;
       // this.fetch(10, 0, 0, null, '', '');

    }
    // ngAfterViewInit(): void {
    //     this.dataSource.sort = this.sort;
    //     this.dataSource.paginator = this.paginator;
    // }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.gridService.reloadEvent.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page, this.gridService.reloadEvent ).pipe(startWith({}), switchMap(() => {
          this.isLoadingResults = true;
          return this.fetch(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction,
            this.filter
          );
        }), map((data: any) => {
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          return data.body.items;
        }), catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe(data => {
        this.records = data;
      });

  }
    public fetch(pageSize: number, offset: number, sortBy, sortType, filters): any {
        // this.isLoading = true;

        this.options = {
            pageSize,
            pageIndex: offset,
            sortBy,
            sortType,
            filters
        };
        this.elementMap = this.elementTypeService.getBaseWithUserTypes();
        let resource = this.elementMap.find(x => x.id === this.parentType);

        for (const type in this.elementMap) {
            if (this.elementMap[type].id === this.parentTypeVal) {
                resource = this.elementMap[type];
                break;
            }
        }

        if (resource) {
        return this.resourcesService[resource.resourceName].get(this.parentIdVal, 'edits', this.options
        );
      } else {
        return this.resourcesService.dataModel.get(this.parent, 'edits', this.options);
          }
        // if (resource) {
        //    return this.resourcesService[resource.resourceName].get(this.parentIdVal, 'edits', this.options
        //     ).subscribe(result => {
        //         this.result = result.body;
        //         this.dataSource = new MatTableDataSource<unknown>(this.result.items);
        //         // this.dataSetResult = this.result.items;
        //         this.totalItemCount = this.result.count;
        //
        //     });
        // } else {
        //    return this.resourcesService.dataModel.get(this.parent, 'edits', this.options).subscribe(result => {
        //         this.result = result.body;
        //     });
        //
        // }
       // this.isLoading = false;

    }
}
