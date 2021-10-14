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
  displayedColumnsUnauthorised: string[];
  records: any[] = [];
  unauthorised: any[] = [];
  unauthorisedCount = 0;
  totalItemCount = 0;
  hideFilters = true;
  dataSource = new MatTableDataSource<any>();

  constructor(private messageHandler: MessageHandlerService,  private resourcesService: MdmResourcesService) {
    this.displayedColumns = ['userEmailAddress', 'userName', 'userOrganisation', 'start', 'lastAccess','lastAccessedUrl'];
    this.displayedColumnsUnauthorised = ['id', 'start', 'lastAccess','lastAccessedUrl'];
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

  activeSessionsFetch() {
    const options = {
      sort: 'userEmailAddress',
      order: 'asc'
    };



     this.resourcesService.session.activeSessions({},options).subscribe(resp => {
      for (const [key] of Object.entries(resp.body.authorisedItems)) {
        resp.body.authorisedItems[key].creationDateTime = new Date(resp.body.authorisedItems[key].creationDateTime);
        resp.body.authorisedItems[key].lastAccessedDateTime = new Date(resp.body.authorisedItems[key].lastAccessedDateTime);
        this.records.push(resp.body.authorisedItems[key]);
      }

      for (const [key] of Object.entries(resp.body.unauthorisedItems)) {
        resp.body.unauthorisedItems[key].creationDateTime = new Date(resp.body.unauthorisedItems[key].creationDateTime);
        resp.body.unauthorisedItems[key].lastAccessedDateTime = new Date(resp.body.unauthorisedItems[key].lastAccessedDateTime);
        this.unauthorised.push(resp.body.unauthorisedItems[key]);
      }

      this.totalItemCount = resp.body.countAuthorised;
      this.unauthorisedCount = resp.body.countUnauthorised;
      this.dataSource.data = this.records;
      console.log(this.records);
    }, err => {
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
}
