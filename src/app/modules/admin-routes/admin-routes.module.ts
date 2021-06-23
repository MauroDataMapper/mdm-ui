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
import { AdminAppContainerComponent } from '@mdm/admin/app-container/app-container.component';
import { DashboardComponent } from '@mdm/admin/home/home.component';
import { EmailsComponent } from '@mdm/admin/emails/emails.component';
import { ModelManagementComponent } from '@mdm/admin/model-management/model-management.component';
import { UsersComponent } from '@mdm/admin/users/users.component';
import { UserComponent } from '@mdm/admin/user/user.component';
import { GroupsComponent } from '@mdm/admin/groups/groups.component';
import { PendingUsersComponent } from '@mdm/admin/pending-users/pending-users.component';
import { ConfigurationComponent } from '@mdm/admin/configuration/configuration.component';
import { Ng2StateDeclaration, UIRouterModule } from '@uirouter/angular';
import { GroupComponent } from '@mdm/admin/group/group.component';
import { ApiPropertyComponent } from '@mdm/admin/api-property/api-property.component';
import { SubscribedCataloguesComponent } from '@mdm/admin/subscribed-catalogues/subscribed-catalogues.component';
import { SubscribedCatalogueComponent } from '@mdm/admin/subscribed-catalogue/subscribed-catalogue.component';
import { OpenidConnectProviderTableComponent } from '@mdm/admin/openid-connect-provider-table/openid-connect-provider-table.component';
import { OpenidConnectProviderComponent } from '@mdm/admin/openid-connect-provider/openid-connect-provider.component';

export const pageRoutes: { states: Ng2StateDeclaration[] } = {
  states: [
    {
      name: 'appContainer.adminArea',
      url: '/admin',
      component: AdminAppContainerComponent,
    },
    {
      name: 'appContainer.adminArea.home',
      url: '/home',
      component: DashboardComponent
    },
    {
      name: 'appContainer.adminArea.emails',
      url: '/emails',
      component: EmailsComponent
    },
    {
      name: 'appContainer.adminArea.modelManagement',
      url: '/modelManagement',
      component: ModelManagementComponent
    },
    {
      name: 'appContainer.adminArea.subscribedCatalogues',
      url: '/subscribedCatalogues',
      component: SubscribedCataloguesComponent
    },
    {
      name: 'appContainer.adminArea.subscribedCatalogue',
      url: '/subscribedCatalogue/{id}',
      params: { id: { value: null, squash: true} },
      component: SubscribedCatalogueComponent
    },
    {
      name: 'appContainer.adminArea.openIdConnectProviders',
      url: '/openidConnectProviders',
      component: OpenidConnectProviderTableComponent
    },
    {
      name: 'appContainer.adminArea.openIdConnectProvider',
      url: '/openidConnectProvider/:id',
      component: OpenidConnectProviderComponent,
      params: {
        id: { value: null, squash: true }
      }
    },
    {
      name: 'appContainer.adminArea.users',
      url: '/users',
      component: UsersComponent
    },
    {
      name: 'appContainer.adminArea.user',
      url: '/user/{id}',
      params: { id: { value: null, squash: true } },
      component: UserComponent
    },
    {
      name: 'appContainer.adminArea.groups',
      url: '/groups',
      component: GroupsComponent
    },
    {
      name: 'appContainer.adminArea.group',
      url: '/group/{id}',
      params: { id: { value: null, squash: true } },
      component: GroupComponent
    },
    {
      name: 'appContainer.adminArea.pendingUsers',
      url: '/pendingUsers',
      component: PendingUsersComponent
    },
    {
      name: 'appContainer.adminArea.configuration',
      url: '/configuration/{tabView:string}',
      component: ConfigurationComponent,
      params: {
        tabView: { dynamic: true, value: null, squash: true}
      }
    },
    {
      name: 'appContainer.adminArea.apiPropertyAdd',
      url: '/property/add',
      component: ApiPropertyComponent
    },
    {
      name: 'appContainer.adminArea.apiPropertyEdit',
      url: '/property/edit/:id',
      component: ApiPropertyComponent
    }
  ]
};

@NgModule({
  declarations: [],
  imports: [UIRouterModule.forChild({ states: pageRoutes.states })]
})
export class AdminRoutesModule { }
