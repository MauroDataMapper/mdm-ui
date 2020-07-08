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
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MessageService } from '../services/message.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';

import { FolderResult } from '../model/folderModel';
import { forkJoin } from 'rxjs';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {MdmPaginatorComponent} from '@mdm/shared/mdm-paginator/mdm-paginator';


@Component({
  selector: 'mdm-group-access-new',
  templateUrl: './group-access-new.component.html',
  styleUrls: ['./group-access-new.component.sass']
})
export class GroupAccessNewComponent implements OnInit {
  displayedColumns: string[] = ['user', 'read', 'write', 'edit'];
  totalItemCount = 0;
  groups = [];
  allGroups = [];
  groupsMap = {};

  folderResult: FolderResult;
  @Input() parent: any;
  @Input() parentType: any;

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;
  // MatPaginator Output
  pageEvent: PageEvent;

  supportedDomainTypes = {
    DataModel: { name: 'dataModel', message: 'Data Model' },
    Classifier: { name: 'classifier', message: 'Classifier' },
    Folder: { name: 'folder', message: 'Folder' },
    Terminology: { name: 'terminology', message: 'Terminology' },
    CodeSet: { name: 'codeSet', message: 'CodeSet' }
  };

  constructor(
    private messageService: MessageService,
    private resourceService: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService
  ) {
    this.dataSource = new MatTableDataSource(this.groups);
  }

  ngOnInit() {
    this.buildGroups();
    this.loadAllGroups('', 0, 0);

    this.dataSource = new MatTableDataSource(this.groups);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'user') {
        return item.group.label;
      }
      if (property === 'read') {
        return item.edit.readAccess;
      }
      if (property === 'write') {
        return item.edit.writeAccess;
      }
    };
  }

  loadAllGroups(text, offset, limit) {
    this.allGroups = [];
    this.securityHandler.isAuthenticated().subscribe(result => {
      if (result.body === false) {
        return;
      }
      limit = limit ? limit : 10;
      offset = offset ? offset : 0;
      const options = {
        pageSize: limit,
        pageIndex: offset,
        //  filters: "search=" + text,
        // sortBy: "emailAddress",
        sortType: 'asc'
      };
      this.resourceService.userGroup.get().subscribe(
        data => {
          this.allGroups = data.body.items;
        },
        error => {
          this.messageHandler.showError(
            'There was a problem getting the group list.',
            error
          );
        }
      );
    });
  }

  buildGroups = function() {
    this.groups = [];

    this.folderResult = this.messageService.getFolderPermissions();
    for (
      let i = 0;
      this.folderResult.writeableByGroups &&
      i < this.folderResult.writeableByGroups.length;
      i++
    ) {
      const group = this.folderResult.writeableByGroups[i];
      this.groupsMap[group.label] = {
        group,
        readAccess: false,
        writeAccess: true
      };
    }

    for (
      let i = 0;
      this.folderResult.readableByGroups &&
      i < this.folderResult.readableByGroups.length;
      i++
    ) {
      const group = this.folderResult.readableByGroups[i];
      if (!this.groupsMap[group.label]) {
        this.groupsMap[group.label] = {
          group,
          readAccess: true,
          writeAccess: false
        };
      } else {
        this.groupsMap[group.label].readAccess = true;
      }
    }

    for (const key in this.groupsMap) {
      if (this.groupsMap.hasOwnProperty(key)) {
        this.groupsMap[key].inEdit = true;
        this.groupsMap[key].edit = {
          group: Object.assign({}, this.groupsMap[key].group),
          writeAccess: this.groupsMap[key].writeAccess,
          readAccess: this.groupsMap[key].readAccess
        };
        this.groups.push(this.groupsMap[key]);
      }
    }

    this.totalItemCount = this.groups.count;
  };

  // public getServerData($event) {
  //     var offset = $event.pageIndex * $event.pageSize;
  //     this.fetch($event.pageSize, offset ,$event.pageIndex, this.sort.active,this.sort.direction,null );
  // }
  //
  // public getSortedData($event) {
  //     this.fetch(this.paginator.pageSize, this.paginator.pageIndex,this.paginator.pageIndex, $event.active,$event.direction,null );
  // }

  save(row, index) {
    // if nothing's changed, then return
    if (
      row.writeAccess === row.edit.writeAccess &&
      row.readAccess === row.edit.readAccess
    ) {
      return;
    }

    const observableCol = [];
    const name = this.supportedDomainTypes[this.parentType].name;
    const message = this.supportedDomainTypes[this.parentType].message;

    const mId = this.folderResult.id;
    const gId = row.edit.group.id;

    if (row.readAccess && !row.edit.readAccess) {
      observableCol.push(
        this.resourceService[name].delete(mId, 'read/group/' + gId)
      );
    } else {
      // Put WriteAccess
      if (!row.writeAccess && row.edit.writeAccess) {
        observableCol.push(
          this.resourceService[name].put(mId, 'write/group/' + gId)
        );
      } else {
        // Delete WriteAccess
        if (row.writeAccess && !row.edit.writeAccess) {
          observableCol.push(
            this.resourceService[name].delete(mId, 'write/group/' + gId)
          );
        } else if (!row.readAccess && row.edit.readAccess) {
          // Put ReadAccess
          observableCol.push(
            this.resourceService[name].put(mId, 'read/group/' + gId)
          );
        }
      }
    }

    forkJoin(observableCol).subscribe(
      () => {
        // if both are false, remove the row
        if (!row.edit.readAccess && !row.edit.writeAccess) {
          this.groups.splice(index, 1);
        } else {
          row.isNew = false;
          row.inEdit = true;
          row.readAccess = row.edit.readAccess;
          row.writeAccess = row.edit.writeAccess;
          row.group = row.edit.group;
          this.groups[index] = row;
        }
        this.messageHandler.showSuccess(message + ' updated successfully.');
        this.refreshDataSource();
      },
      error => {
        this.messageHandler.showError(
          'There was a problem updating the ' + message + '.',
          error
        );
      }
    );
  }

  add() {
    this.paginator.pageIndex = 0 ;
    const newRecord = {
      group: null,
      writeAccess: false,
      readAccess: false,
      edit: {
        group: null,
        writeAccess: false,
        readAccess: false
      },
      inEdit: true,
      isNew: true
    };
    this.groups = [].concat([newRecord]).concat(this.groups);
    this.refreshDataSource();
  }

  cancelEdit(record, index) {
    if (record.isNew) {
      this.groups.splice(index, 1);
      this.refreshDataSource();
    }
  }

  refreshDataSource() {
    this.dataSource.data = this.groups;
  }
  onGroupSelect = (select, record) => {
    delete record.edit.errors;
    record.edit.group = select;
  };

  validate(record, index) {
    let isValid = true;
    record.edit.errors = [];
    if (!record.edit.group) {
      record.edit.errors.group = 'Group can\'t be empty!';
      isValid = false;
    }
    if (isValid) {
      delete record.edit.errors;
    }
    return isValid;
  }

  readAccessChecked(record, index) {
    if (record.edit.readAccess === false) {
      record.edit.writeAccess = false;
    }
    if (record.inEdit && !record.isNew) {
      this.save(record, index);
    }
  }

  writeAccessChecked(record, index) {
    if (record.edit.writeAccess === true) {
      record.edit.readAccess = true;
    }
    if (record.inEdit && !record.isNew) {
      this.save(record, index);
    }
  }
}
