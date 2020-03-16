import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { FolderResult } from '../model/folderModel';
import { ResourcesService } from '../services/resources.service';
import { forkJoin } from 'rxjs';
import { forEach } from '@uirouter/core';
import { MessageHandlerService } from '../services/utility/message-handler.service';
import { ValidatorService } from '../services/validator.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { McSelectPagination } from '../utility/mc-select/mc-select.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'mdm-user-access-new',
  templateUrl: './user-access-new.component.html',
  styleUrls: ['./user-access-new.component.sass']
})
export class UserAccessNewComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'user',
    'firstName',
    'lastName',
    'read',
    'write',
    'edit'
  ];
  users = [];
  usersMap = {};
  folderResult: FolderResult;
  @Input() parent: '=';
  @Input() parentType: '=';
  dataSource: MatTableDataSource<any>;
  pagination: McSelectPagination;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  supportedDomainTypes = {
    DataModel: { name: 'dataModel', message: 'Data Model' },
    Classifier: { name: 'classifier', message: 'Classifier' },
    Folder: { name: 'folder', message: 'Folder' },
    Terminology: { name: 'terminology', message: 'Terminology' },
    CodeSet: { name: 'codeset', message: 'CodeSet' }
  };
  constructor(
    private messageService: MessageService,
    private resourceService: ResourcesService,
    private messageHandler: MessageHandlerService,
    private validator: ValidatorService
  ) {
    this.dataSource = new MatTableDataSource(this.users);
  }

  ngOnInit() {
    this.buildUsers();
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'user') {
        return item.user.emailAddress;
      }
      if (property === 'firstName') {
        return item.user.firstName;
      }
      if (property === 'lastName') {
        return item.user.lastName;
      }
      if (property === 'read') {
        return item.edit.readAccess;
      }
      if (property === 'write') {
        return item.edit.writeAccess;
      }
    };
  }

  ngAfterViewInit() {}

  buildUsers() {
    this.folderResult = this.messageService.getFolderPermissions();
    for (
      let i = 0;
      this.folderResult.writeableByUsers &&
      i < this.folderResult.writeableByUsers.length;
      i++
    ) {
      const user = this.folderResult.writeableByUsers[i];
      this.usersMap[user.emailAddress] = {
        user,
        readAccess: false,
        writeAccess: true
      };
    }

    for (
      let i = 0;
      this.folderResult.readableByUsers &&
      i < this.folderResult.readableByUsers.length;
      i++
    ) {
      const user = this.folderResult.readableByUsers[i];
      if (!this.usersMap[user.emailAddress]) {
        this.usersMap[user.emailAddress] = {
          user,
          readAccess: true,
          writeAccess: false
        };
      } else {
        this.usersMap[user.emailAddress].readAccess = true;
      }
    }

    for (const key in this.usersMap) {
      if (this.usersMap.hasOwnProperty(key)) {
        this.usersMap[key].inEdit = true;
        this.usersMap[key].isNew = false;

        this.usersMap[key].edit = {
          id: this.usersMap[key].user.id,
          user: Object.assign({}, this.usersMap[key].user),
          firstName: this.usersMap[key].user.firstName,
          lastName: this.usersMap[key].user.lastName,
          writeAccess: this.usersMap[key].writeAccess,
          readAccess: this.usersMap[key].readAccess
        };

        this.users.push(this.usersMap[key]);
        // console.log(this.users);
      }
    }
  }

  save(row, index) {
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

    // this.resourceService[name].put(mId, "write/user/", {resource: resource});
    // in edit mode, we save them here

    if (row.edit.user && row.edit.user.id !== -1) {
      const uId = row.edit.user.id;
      // Delete ReadAccess
      if (row.readAccess && !row.edit.readAccess) {
        observableCol.push(
          this.resourceService[name].delete(mId, 'read/user/' + uId)
        );
      } else {
        // Put WriteAccess
        if (!row.writeAccess && row.edit.writeAccess) {
          observableCol.push(
            this.resourceService[name].put(mId, 'write/user/' + uId)
          );
        } else {
          // Delete WriteAccess
          if (row.writeAccess && !row.edit.writeAccess) {
            observableCol.push(
              this.resourceService[name].delete(mId, 'write/user/' + uId)
            );
          } else if (!row.readAccess && row.edit.readAccess) {
            // Put ReadAccess
            observableCol.push(
              this.resourceService[name].put(mId, 'read/user/' + uId)
            );
          }
        }
      }
    } else {
      const resource = {
        emailAddress: row.edit.user.emailAddress,
        firstName: row.edit.user.firstName,
        lastName: row.edit.user.lastName
      };

      // in new mode, it's a completely new user
      if (row.edit.writeAccess) {
        observableCol.push(
          this.resourceService[name].put(mId, 'write/user/', { resource })
        );
      } else if (!row.edit.writeAccess && row.edit.readAccess) {
        // if it's Write, then do not call read
        observableCol.push(
          this.resourceService[name].put(mId, 'read/user/', { resource })
        );
      }
    }

    forkJoin(observableCol).subscribe(
      (results: any) => {
        row.readAccess = row.edit.readAccess;
        row.writeAccess = row.edit.writeAccess;
        row.user = {
          id: row.edit.user.id,
          emailAddress: row.edit.user.emailAddress,
          firstName: row.edit.user.firstName,
          lastName: row.edit.user.lastName
        };

        // if it's a new User, then we need to find the user's ID
        // So go through all the users and find the user id by matching the email address
        if (row.isNew) {
          forEach(results[0].body.readableByUsers, rbu => {
            if (
              rbu.emailAddress.toLowerCase() ===
              row.user.emailAddress.toLowerCase()
            ) {
              row.user.id = rbu.id;
            }
          });
        }

        // if both are false, remove the row
        if (!row.edit.readAccess && !row.edit.writeAccess) {
          this.users.splice(index, 1);
        } else {
          row.isNew = false;
          row.inEdit = true;
          this.users[index] = row;
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
    const newRecord = {
      id: '',
      user: {
        id: '',
        user: null,
        firstName: '',
        lastName: '',
        emailAddress: '',
        writeAccess: false,
        readAccess: false
      },
      firstName: '',
      lastName: '',
      writeAccess: false,
      readAccess: false,
      emailAddress: '',
      edit: {
        id: '',
        user: {
          id: '',
          user: null,
          firstName: '',
          lastName: '',
          emailAddress: '',
          writeAccess: false,
          readAccess: false
        },
        firstName: '',
        lastName: '',
        emailAddress: '',
        writeAccess: false,
        readAccess: false
      },
      inEdit: true,
      isNew: true
    };

    // this.users = this.users.concat([newRecord]);
    this.users = [].concat([newRecord]).concat(this.users);
    this.refreshDataSource();
  }

  cancelEdit(record, index) {
    if (record.isNew) {
      this.users.splice(index, 1);
      this.refreshDataSource();
    }
  }

  refreshDataSource() {
    this.dataSource.data = this.users;
  }

  onUserSelect(select, record) {
    delete record.edit.errors;
    // if removed
    if (!select) {
      record.edit.user = null;
    } else {
      record.edit.user = {
        id: select.id,
        emailAddress: select.emailAddress,
        firstName: select.firstName,
        lastName: select.lastName
      };
    }
  }

  validate(record, index) {
    let isValid = true;
    record.edit = record.edit || {};
    record.edit.errors = [];

    if (!record.edit.user) {
      record.edit.errors.user = 'User Email can\'t be empty!';
      isValid = false;
    }

    if (
      record.edit.user &&
      !this.validator.validateEmail(record.edit.user.emailAddress)
    ) {
      record.edit.errors.user = 'Invalid Email';
      isValid = false;
    }

    if (
      record.edit.user &&
      this.validator.isEmpty(record.edit.user.firstName)
    ) {
      record.edit.errors.firstName = 'FirstName can\'t be empty!';
      isValid = false;
    }

    if (record.edit.user && this.validator.isEmpty(record.edit.user.lastName)) {
      record.edit.errors.lastName = 'LastName can\'t be empty!';
      isValid = false;
    }

    if (isValid) {
      delete record.edit.errors;
    }
    return isValid;
  }

  fetchUser(text, offset, limit) {
    limit = limit ? limit : 0;
    offset = offset ? offset : 0;
    const options = {
      pageSize: limit,
      pageIndex: offset,
      filters: 'search=' + text,
      sortBy: 'emailAddress',
      sortType: 'asc'
    };
    return this.resourceService.catalogueUser.get(null, 'search', options);
  }

  readAccessChecked = function(record, index) {
    if (record.edit.readAccess === false) {
      record.edit.writeAccess = false;
    }
    if (record.inEdit && !record.isNew) {
      this.save(record, index);
    }
  };

  writeAccessChecked(record, index) {
    if (record.edit.writeAccess === true) {
      record.edit.readAccess = true;
    }
    if (record.inEdit && !record.isNew) {
      this.save(record, index);
    }
  }
}
