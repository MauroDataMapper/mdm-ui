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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAppContainerComponent } from '@mdm/admin/app-container/app-container.component';
import { AdminRoutesModule } from '../admin-routes/admin-routes.module';
import { SharedModule } from '../shared/shared.module';
import { EmailsComponent } from '@mdm/admin/emails/emails.component';
import { GroupMemberTableComponent } from '@mdm/admin/group-member-table/group-member-table.component';
import { UserComponent } from '@mdm/admin/user/user.component';
import { ProfilesDashboardComponent } from '@mdm/profiles-dashboard/profiles-dashboard.component';
import { OpenidConnectProviderTableComponent } from '@mdm/admin/openid-connect-provider-table/openid-connect-provider-table.component';
import { OpenidConnectProviderComponent } from '@mdm/admin/openid-connect-provider/openid-connect-provider.component';
import { DoiRedirectComponent } from '@mdm/doi-redirect/doi-redirect.component';

@NgModule({
  declarations: [
    AdminAppContainerComponent,
    EmailsComponent,
    GroupMemberTableComponent,
    UserComponent,
    ProfilesDashboardComponent,
    OpenidConnectProviderTableComponent,
    OpenidConnectProviderComponent,
    DoiRedirectComponent
  ],
  imports: [CommonModule, AdminRoutesModule, SharedModule],
  exports: [
    AdminAppContainerComponent,
    EmailsComponent,
    GroupMemberTableComponent,
    UserComponent,
    ProfilesDashboardComponent
  ]
})
export class AdminModule {}
