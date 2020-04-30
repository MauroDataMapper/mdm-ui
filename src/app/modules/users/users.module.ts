import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersAppContainerComponent } from '@mdm/users/users-app-container/users-app-container.component';
import { ProfileComponent } from '@mdm/userArea/profile/profile.component';
import { ImgCroppieComponent } from '@mdm/shared/img-croppie/img-croppie.component';
import { UserDetailsComponent } from '@mdm/userArea/user-details/user-details.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedModule } from '../shared/shared.module';
import { UsersRoutesModule } from '../users-routes/users-routes.module';
import { ChangePasswordComponent } from '@mdm/userArea/change-password/change-password.component';

@NgModule({
  declarations: [
    UsersAppContainerComponent,
    ProfileComponent,
    ImgCroppieComponent,
    UserDetailsComponent,
    ChangePasswordComponent
  ],
  imports: [CommonModule, ImageCropperModule, SharedModule, UsersRoutesModule],
  exports: [
    UsersAppContainerComponent,
    ProfileComponent,
    ImgCroppieComponent,
    UserDetailsComponent
  ]
})
export class UsersModule {}
