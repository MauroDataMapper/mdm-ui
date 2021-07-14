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
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { EditingService } from '@mdm/services/editing.service';
import { CatalogueItem } from '@maurodatamapper/mdm-resources';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'mdm-group-access-new',
  templateUrl: './group-access-new.component.html',
  styleUrls: ['./group-access-new.component.sass'],
})
export class GroupAccessNewComponent implements OnInit {
  @Input() catalogueItem: CatalogueItem;
  @Input() canAddGroups = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  displayedColumns: string[] = ['user', 'access', 'edit'];
  totalItemCount = 0;
  groups = [];
  allGroups = [];
  groupsMap = {};
  accessLevels = [];
  loading = true;
  dataSource: MatTableDataSource<any>;


  constructor(
    private resourceService: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService) {
    this.dataSource = new MatTableDataSource(this.groups);
  }

  ngOnInit() {
    this.buildGroups();
    this.loadAllGroups();

    this.dataSource = new MatTableDataSource(this.groups);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'user') {
        return item.group.name;
      }
      if (property === 'read') {
        return item.edit.readAccess;
      }
      if (property === 'write') {
        return item.edit.writeAccess;
      }
    };
  }

  loadAllGroups() {
    this.allGroups = [];

    this.securityHandler
      .isAuthenticated()
      .subscribe((result) => {
        if (!result.body.authenticatedSession) {
          return;
        }

        this.resourceService.userGroups
          .list({all:true})
          .pipe(
            catchError(error => {
              this.messageHandler.showError('There was a problem getting the group list.', error);
              return EMPTY;
            })
          )
          .subscribe(data => this.allGroups = data.body.items);
      });
  }

  buildGroups() {
    this.groups = [];
    this.loading = true;

    forkJoin([
      this.resourceService.securableResource.getGroupRoles(this.catalogueItem.domainType, this.catalogueItem.id, ''),
      this.resourceService.securableResource.getSecurableResourceGroupRole(this.catalogueItem.domainType, this.catalogueItem.id, '')
    ])
      .pipe(
        catchError(error => {
          this.messageHandler.showError('Unable to load group roles.', error);
          return EMPTY;
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(([groupRoles, resourceGroupRole]: [any, any]) => {
        this.accessLevels = groupRoles.body.items;
        this.groups = resourceGroupRole.body.items;
        this.totalItemCount = resourceGroupRole.body.count;
        this.refreshDataSource();
      });
  };

  save(row) {
    this.resourceService.securableResource
      .addUserGroupToSecurableResourceGroupRole(
        this.catalogueItem.domainType,
        this.catalogueItem.id,
        row.groupLevelId.id,
        row.edit.group.id,
        null)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem saving this group.', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Group saved successfully.');

        row.inEdit = false;
        this.editingService.setFromCollection(this.groups);

        this.buildGroups();
      });
  }

  add() {
    this.paginator.pageIndex = 0;
    const newRecord = {
      group: null,
      writeAccess: false,
      readAccess: false,
      edit: {
        group: null,
        writeAccess: false,
        readAccess: false,
      },
      inEdit: true,
      isNew: true,
    };
    this.groups = [].concat([newRecord]).concat(this.groups);
    this.editingService.setFromCollection(this.groups);
    this.refreshDataSource();
  }

  cancelEdit(record, index: number) {
    this.editingService.confirmCancelAsync().subscribe(confirm => {
      if (!confirm) {
        return;
      }

      if (record.isNew) {
        this.groups.splice(index, 1);
        this.refreshDataSource();
      }

      this.editingService.setFromCollection(this.groups);
    });
  }

  refreshDataSource() {
    this.dataSource.data = this.groups;
  }

  onGroupSelect(select, record) {
    delete record.edit.errors;
    record.edit.group = select;
  }

  onGroupAccessSelect(select, record) {
    record.groupLevelId = select;
  }

  validate(record) {
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

  readAccessChecked(record) {
    if (record.edit.readAccess === false) {
      record.edit.writeAccess = false;
    }
    if (record.inEdit && !record.isNew) {
      this.save(record);
    }
  }

  writeAccessChecked(record) {
    if (record.edit.writeAccess === true) {
      record.edit.readAccess = true;
    }
    if (record.inEdit && !record.isNew) {
      this.save(record);
    }
  }

  deleteRecord(record) {
    this.resourceService.securableResource
      .removeUserGroupFromSecurableResourceGroupRole(
        this.catalogueItem.domainType,
        this.catalogueItem.id,
        record.groupRole.id,
        record.userGroup.id)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem removing this group.', error);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Group removed successfully.');
        this.buildGroups();
      });
  }
}
