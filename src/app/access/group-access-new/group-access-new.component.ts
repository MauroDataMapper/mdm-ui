/*
Copyright 2020-2024 University of Oxford and NHS England

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
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { EditingService } from '@mdm/services/editing.service';
import {
  CatalogueItem,
  GroupRole,
  GroupRoleIndexResponse,
  SecurableResourceGroupRole,
  SecurableResourceGroupRoleIndexResponse,
  UserGroup,
  UserGroupIndexResponse
} from '@maurodatamapper/mdm-resources';
import { EMPTY, forkJoin, merge, Observable, Subject } from 'rxjs';
import {
  catchError,
  filter,
  finalize,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GridService } from '@mdm/services';

@Component({
  selector: 'mdm-group-access-new',
  templateUrl: './group-access-new.component.html',
  styleUrls: ['./group-access-new.component.scss']
})
export class GroupAccessNewComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @Input() catalogueItem: CatalogueItem;
  @Input() canAddGroups = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true })
  paginator: MdmPaginatorComponent;

  displayedColumns: string[] = ['userGroup', 'groupRole', 'action'];
  totalItemCount = 0;
  securableResourceGroupRoles: SecurableResourceGroupRole[] = [];
  userGroups: UserGroup[] = [];
  groupRoles: GroupRole[] = [];
  loading = true;
  state: 'view' | 'add' = 'view';
  dataSource: MatTableDataSource<SecurableResourceGroupRole>;
  formGroup = new FormGroup({
    userGroup: new FormControl<UserGroup>(null, Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
    groupRole: new FormControl<GroupRole>(null, Validators.required) // eslint-disable-line @typescript-eslint/unbound-method
  });

  private unsubscribe$ = new Subject<void>();

  constructor(
    private resources: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService,
    private grid: GridService
  ) {
    this.dataSource = new MatTableDataSource(this.securableResourceGroupRoles);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.securableResourceGroupRoles);

    const userGroups$: Observable<UserGroupIndexResponse> = this.resources.userGroups.list(
      { all: true }
    );

    const groupRoles$: Observable<GroupRoleIndexResponse> = this.resources.securableResource.getGroupRoles(
      this.catalogueItem.domainType,
      this.catalogueItem.id,
      ''
    );

    this.securityHandler
      .isAuthenticated()
      .pipe(
        filter((authenticated) => authenticated.body.authenticatedSession),
        switchMap(() => {
          this.loading = true;

          return forkJoin([userGroups$, groupRoles$]);
        }),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem getting the group list.',
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe(([userGroups, groupRoles]) => {
        this.userGroups = userGroups.body.items;
        this.groupRoles = groupRoles.body.items;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.sort.sortChange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => (this.paginator.pageIndex = 0));

    this.loadSecurableResourceGroupRoles();
  }

  startAdding() {
    this.state = 'add';
    this.formGroup.reset({
      userGroup: null,
      groupRole: null
    });
    this.editingService.start();
  }

  stopAdding() {
    this.state = 'view';
    this.editingService.stop();
  }

  addGroup() {
    if (this.formGroup.invalid) {
      return;
    }

    this.resources.securableResource
      .addUserGroupToSecurableResourceGroupRole(
        this.catalogueItem.domainType,
        this.catalogueItem.id,
        this.formGroup.controls.groupRole.value.id,
        this.formGroup.controls.userGroup.value.id,
        null
      )
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem saving this group.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.stopAdding();
        this.loadSecurableResourceGroupRoles();
      });
  }

  deleteGroup(item: SecurableResourceGroupRole) {
    this.resources.securableResource
      .removeUserGroupFromSecurableResourceGroupRole(
        this.catalogueItem.domainType,
        this.catalogueItem.id,
        item.groupRole.id,
        item.userGroup.id
      )
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem removing this group.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.loadSecurableResourceGroupRoles();
      });
  }

  private loadSecurableResourceGroupRoles() {
    merge(this.paginator.page, this.sort.sortChange)
      .pipe(
        startWith([]),
        switchMap(() => {
          this.loading = true;

          const filters = this.grid.constructOptions(
            this.paginator.pageSize,
            this.paginator.pageIndex,
            this.getSortField(),
            this.sort.direction
          );

          return this.resources.securableResource.getSecurableResourceGroupRole(
            this.catalogueItem.domainType,
            this.catalogueItem.id,
            '',
            filters
          );
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((response: SecurableResourceGroupRoleIndexResponse) => {
        this.securableResourceGroupRoles = response.body.items;
        this.totalItemCount = response.body.count;
        this.dataSource.data = this.securableResourceGroupRoles;
      });
  }

  private getSortField() {
    if (this.sort.active === 'userGroup') {
      return 'userGroup.name';
    }

    if (this.sort.active === 'groupRole') {
      return 'groupRole.displayName';
    }

    return undefined;
  }
}
