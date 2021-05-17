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
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ProfileComponent } from '@mdm/userArea/profile/profile.component';
import { SettingsComponent } from '@mdm/userArea/settings/settings.component';
import { UsersAppContainerComponent } from '@mdm/users/users-app-container/users-app-container.component';
import { UIRouterModule } from '@uirouter/angular';
import { ChangePasswordComponent } from '@mdm/userArea/change-password/change-password.component';
import { ApiKeysComponent } from '@mdm/userArea/api-keys/api-keys.component';

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
