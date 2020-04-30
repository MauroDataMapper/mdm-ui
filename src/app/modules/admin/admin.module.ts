import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAppContainerComponent } from '@mdm/admin/app-container/app-container.component';
import { AdminRoutesModule } from '../admin-routes/admin-routes.module';
import { SharedModule } from '../shared/shared.module';
import { EmailsComponent } from '@mdm/admin/emails/emails.component';
import { GroupMemberTableComponent } from '@mdm/admin/group-member-table/group-member-table.component';
import { UserComponent } from '@mdm/admin/user/user.component';

@NgModule({
  declarations: [
    AdminAppContainerComponent,
    EmailsComponent,
    GroupMemberTableComponent,
    UserComponent
  ],
  imports: [CommonModule, AdminRoutesModule, SharedModule],
  exports: [
    AdminAppContainerComponent,
    EmailsComponent,
    GroupMemberTableComponent,
    UserComponent
  ]
})
export class AdminModule {}
