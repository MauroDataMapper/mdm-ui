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
import { MessageService } from '../services/message.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-group-access-new',
  templateUrl: './group-access-new.component.html',
  styleUrls: ['./group-access-new.component.sass'],
})
export class GroupAccessNewComponent implements OnInit {
  @Input() parent: any;
  @Input() parentType: any;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;
  displayedColumns: string[] = ['user', 'access', 'edit'];
  totalItemCount = 0;
  groups = [];
  allGroups = [];
  groupsMap = {};
  editable = false;
  accessLevels = [];
  isLoadingResults = true;

  folderResult: any;

  dataSource: MatTableDataSource<any>;
  // MatPaginator Output
  pageEvent: PageEvent;

  supportedDomainTypes = {
    DataModel: { name: 'dataModel', message: 'Data Model' },
    Classifier: { name: 'classifier', message: 'Classifier' },
    Folder: { name: 'folder', message: 'Folder' },
    Terminology: { name: 'terminology', message: 'Terminology' },
    CodeSet: { name: 'codeSet', message: 'CodeSet' },
  };

  constructor(
    private messageService: MessageService,
    private resourceService: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService) {
    this.dataSource = new MatTableDataSource(this.groups);
  }

  ngOnInit() {
    this.buildGroups();
    this.loadAllGroups('', 0, 0);

    this.editable = this.folderResult?.availableActions.indexOf('update') !== -1;

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

  loadAllGroups(text, offset, limit) {
    this.allGroups = [];
    this.securityHandler.isAuthenticated().subscribe((result) => {
      if (!result.body.authenticatedSession) {
        return;
      }
      limit = limit ? limit : 10;
      offset = offset ? offset : 0;
      this.resourceService.userGroups.list().subscribe((data) => {
        this.allGroups = data.body.items;
      }, (error) => {
        this.messageHandler.showError('There was a problem getting the group list.', error);
      });
    });
  }

  buildGroups = () => {
    this.groups = [];
    this.folderResult = this.messageService.getFolderPermissions();
    this.isLoadingResults = true;
    this.resourceService.securableResource.getGroupRoles(this.folderResult?.domainType, this.folderResult?.id, '').subscribe((res) => {
      this.accessLevels = res.body.items;
      this.resourceService.securableResource.getSecurableResourceGroupRole(this.folderResult?.domainType, this.folderResult?.id, '').subscribe((result) => {
        this.groups = result.body.items;
        this.totalItemCount = result.body.count;
        this.isLoadingResults = false;
        this.refreshDataSource();
      });
    });
  };

  save(row) {
    const mId = this.folderResult.id;
    const gId = row.edit.group.id;
    const levelId = row.groupLevelId.id;

    this.resourceService.securableResource.addUserGroupToSecurableResourceGroupRole(this.folderResult?.domainType, mId, levelId, gId, null).subscribe(() => {
      this.messageHandler.showSuccess('Save Successful');

      row.inEdit = false;
      this.editingService.setFromCollection(this.groups);

      this.buildGroups();
    }, (error) => {
      this.messageHandler.showError('Save Error', error);
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

  cancelEdit(record, index) {
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
  onGroupSelect = (select, record) => {
    delete record.edit.errors;
    record.edit.group = select;
  };

  onGroupAccessSelect = (select, record) => {
    record.groupLevelId = select;
  };

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

  deleteRecord = (record) => {
    this.resourceService.securableResource.removeUserGroupFromSecurableResourceGroupRole(this.folderResult?.domainType, this.folderResult?.id, record.groupRole.id, record.userGroup.id).subscribe(() => {
      this.messageHandler.showSuccess('Delete Successful');
      this.buildGroups();
    }, (error) => {
      this.messageHandler.showError('Error Removing', error);
    });
  };
}
