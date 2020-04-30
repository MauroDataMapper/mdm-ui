import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ProfileComponent } from '@mdm/userArea/profile/profile.component';
import { SettingsComponent } from '@mdm/userArea/settings/settings.component';
import { UsersAppContainerComponent } from '@mdm/users/users-app-container/users-app-container.component';
import { UIRouterModule } from '@uirouter/angular';
import { ChangePasswordComponent } from '@mdm/userArea/change-password/change-password.component';

export const PagesRoutes = {
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
    }
  ]
};

@NgModule({
  declarations: [],
  imports: [UIRouterModule.forChild({ states: PagesRoutes.states })],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ]
})
export class UsersRoutesModule {}
