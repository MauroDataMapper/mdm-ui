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
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  ViewChild,
} from '@angular/core';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mdm-active-sessions',
  templateUrl: './active-sessions.component.html',
  styleUrls: ['./active-sessions.component.sass']
})
export class ActiveSessionsComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  displayedColumns: string[];
  records: any[] = [];
  totalItemCount = 0;
  hideFilters = true;
  dataSource = new MatTableDataSource<any>();

  constructor(private messageHandler: MessageHandlerService, private resourcesService: MdmResourcesService) {
    this.displayedColumns = [ 'userEmailAddress', 'userName', 'userOrganisation', 'start', 'lastAccess'];
  }

  ngOnInit() {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    }
    this.activeSessionsFetch();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  activeSessionsFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {
    const options = {
      sortBy: 'userEmailAddress',
      sortType: 'asc'
    };

    
   this.resourcesService.admin.activeSessions(options)
      .subscribe(resp => {
        for (const [key, value] of Object.entries(resp.body.items)) {
          resp.body.items[key].creationDateTime = new Date(resp.body.items[key].creationDateTime);
          resp.body.items[key].lastAccessedDateTime = new Date(resp.body.items[key].lastAccessedDateTime);

          this.records.push(resp.body.items[key]);
        }
        this.totalItemCount = this.records.length;
        this.dataSource.data = this.records;
      },
      err => {
        this.messageHandler.showError('There was a problem loading the active sessions.', err);
      });
  }

  isToday(date) {
    const today = new Date();

    if (today.getUTCFullYear() === date.getUTCFullYear() && today.getUTCMonth() === date.getUTCMonth() && today.getUTCDate() === date.getUTCDate()) {
      return true;
    }

    return false;
  }

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  };

  applyFilter = () => {
    // TODO
  };

  editUser = (var1?) => {
    // TODO
  }
}
