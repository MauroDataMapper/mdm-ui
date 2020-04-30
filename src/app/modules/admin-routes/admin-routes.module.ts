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
import { UIRouterModule } from '@uirouter/angular';
import { GroupComponent } from '@mdm/admin/group/group.component';

export const PagesRoutes = {
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
        url: '/configuration',
        component: ConfigurationComponent
    }

  ]
};

@NgModule({
  declarations: [],
  imports: [UIRouterModule.forChild({ states: PagesRoutes.states })]
})
export class AdminRoutesModule {}
