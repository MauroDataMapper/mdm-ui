import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAppContainerComponent } from '../../admin/app-container/app-container.component';
import { AdminRoutesModule } from '../admin-routes/admin-routes.module';
import { SharedModule } from '../shared/shared.module';
import { EmailsComponent } from '../../admin/emails/emails.component';
import { GroupMemberTableComponent } from '../../admin/group-member-table/group-member-table.component';
import { UserComponent } from '../../admin/user/user.component';

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
