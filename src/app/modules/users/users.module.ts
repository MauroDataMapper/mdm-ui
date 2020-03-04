import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersAppContainerComponent } from "../../users/users-app-container/users-app-container.component";
import { ProfileComponent } from "../../userArea/profile/profile.component";
import { ImgCroppieComponent } from "../../shared/img-croppie/img-croppie.component";
import { UserDetailsComponent } from "../../userArea/user-details/user-details.component";
import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedModule } from "../shared/shared.module";
import { UsersRoutesModule } from "../users-routes/users-routes.module";
import { ChangePasswordComponent } from '../../userArea/change-password/change-password.component';



@NgModule({
    declarations: [UsersAppContainerComponent, ProfileComponent, ImgCroppieComponent, UserDetailsComponent,  ChangePasswordComponent],
    imports: [
        CommonModule,
        ImageCropperModule,
        SharedModule,
        UsersRoutesModule

        ],
    exports: [
        UsersAppContainerComponent, ProfileComponent, ImgCroppieComponent, UserDetailsComponent
        ]
})
export class UsersModule { }
