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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersAppContainerComponent } from '@mdm/users/users-app-container/users-app-container.component';
import { ProfileComponent } from '@mdm/userArea/profile/profile.component';
import { UserDetailsComponent } from '@mdm/userArea/user-details/user-details.component';
import { SharedModule } from '@mdm/shared/shared.module';
import { UsersRoutesModule } from '../users-routes/users-routes.module';
import { ChangePasswordComponent } from '@mdm/userArea/change-password/change-password.component';
import { ApiKeysComponent } from '@mdm/userArea/api-keys/api-keys.component';
import { AsyncJobListComponent } from '@mdm/userArea/async-job-list/async-job-list.component';
import { AsyncJobDetailComponent } from '@mdm/userArea/async-job-detail/async-job-detail.component';
import { DomainExportsListComponent } from '@mdm/userArea/domain-exports-list/domain-exports-list.component';
import { DomainExportsDetailComponent } from '@mdm/userArea/domain-exports-detail/domain-exports-detail.component';

@NgModule({
  declarations: [
    UsersAppContainerComponent,
    ProfileComponent,
    UserDetailsComponent,
    ChangePasswordComponent,
    ApiKeysComponent,
    AsyncJobListComponent,
    AsyncJobDetailComponent,
    DomainExportsListComponent,
    DomainExportsDetailComponent
  ],
  imports: [CommonModule, SharedModule, UsersRoutesModule],
  exports: [
    UsersAppContainerComponent,
    ProfileComponent,
    UserDetailsComponent
  ]
})
export class UsersModule {}
