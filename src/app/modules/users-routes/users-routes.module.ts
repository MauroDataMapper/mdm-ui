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
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ProfileComponent } from '@mdm/userArea/profile/profile.component';
import { SettingsComponent } from '@mdm/userArea/settings/settings.component';
import { UsersAppContainerComponent } from '@mdm/users/users-app-container/users-app-container.component';
import { UIRouterModule } from '@uirouter/angular';
import { ChangePasswordComponent } from '@mdm/userArea/change-password/change-password.component';
import { ApiKeysComponent } from '@mdm/userArea/api-keys/api-keys.component';
import { AsyncJobListComponent } from '@mdm/userArea/async-job-list/async-job-list.component';
import { AsyncJobDetailComponent } from '@mdm/userArea/async-job-detail/async-job-detail.component';
import { DomainExportsListComponent } from '@mdm/userArea/domain-exports-list/domain-exports-list.component';
import { DomainExportsDetailComponent } from '@mdm/userArea/domain-exports-detail/domain-exports-detail.component';

export const pageRoutes = {
  states: [
    {
      name: 'appContainer.userArea',
      url: '/user',
      component: UsersAppContainerComponent
    },
    {
      name: 'appContainer.userArea.profile',
      url: '/profile',
      component: ProfileComponent
    },
    {
      name: 'appContainer.userArea.settings',
      url: '/settings',
      component: SettingsComponent
    },
    {
      name: 'appContainer.userArea.changePassword',
      url: '/profile/changePassword',
      component: ChangePasswordComponent
    },
    {
      name: 'appContainer.userArea.apiKeys',
      url: '/profile/api',
      component: ApiKeysComponent
    },
    {
      name: 'appContainer.userArea.asyncJobs',
      url: '/profile/jobs',
      component: AsyncJobListComponent
    },
    {
      name: 'appContainer.userArea.asyncJobDetail',
      url: '/profile/jobs/{id}',
      component: AsyncJobDetailComponent,
      params: { id: { value: null, squash: true } }
    },
    {
      name: 'appContainer.userArea.domainExports',
      url: '/profile/exports',
      component: DomainExportsListComponent
    },
    {
      name: 'appContainer.userArea.domainExportsDetail',
      url: '/profile/exports/{id}',
      component: DomainExportsDetailComponent,
      params: {
        id: { value: null, squash: true }
      }
    }
  ]
};

@NgModule({
  declarations: [],
  imports: [UIRouterModule.forChild({ states: pageRoutes.states })],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ]
})
export class UsersRoutesModule {}
