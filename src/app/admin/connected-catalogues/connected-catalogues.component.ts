/*
Copyright 2021 University of Oxford

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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { merge, Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-connected-catalogues',
  templateUrl: './connected-catalogues.component.html',
  styleUrls: ['./connected-catalogues.component.scss']
})
export class ConnectedCataloguesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  isLoadingResults: boolean;
  totalItemCount = 0;

  dataSource = new MatTableDataSource<any>();

  displayedColumns = ['url', 'apiKey', 'icons'];
  records: any[] = [];

  constructor(
    private resources: MdmResourcesService,
    private gridService: GridService,
    private title: Title) {
    this.dataSource = new MatTableDataSource(this.records);
  }

  ngOnInit(): void {
    this.title.setTitle('Connected catalogues');
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.sort = this.sort;

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.fetchConnections(
            this.paginator.pageSize,
            this.paginator.pageOffset,
            this.sort.active,
            this.sort.direction
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
        this.records = data;
        this.dataSource.data = this.records;
      });
  }

  fetchConnections(
    pageSize?: number, 
    pageIndex?: number, 
    sortBy?: string, 
    sortType?: SortDirection): Observable<any> {
    const options = this.gridService.constructOptions(
      pageSize, 
      pageIndex, 
      sortBy, 
      sortType);    
    
    // TODO: fetch data from server
    const results = {
      body: {
        count: 2,
        items: [
          {
            url: 'http://www.bbc.co.uk',
            apiKey: '12345'
          },
          {
            url: 'http://www.google.co.uk',
            apiKey: 'xyz999'
          }
        ]
      }
    };

    return of(results);    
  }

  addConnection() {
    alert('TODO: add connection');
  }

  editConnection(record) {
    alert('TODO: edit connection');
  }

  deleteConnection(record) {
    alert('TODO: delete connection');
  }
}
