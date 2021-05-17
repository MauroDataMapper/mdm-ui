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
import { UsersAppContainerComponent } from '@mdm/users/users-app-container/users-app-container.component';
import { ProfileComponent } from '@mdm/userArea/profile/profile.component';
import { ImgCroppieComponent } from '@mdm/shared/img-croppie/img-croppie.component';
import { UserDetailsComponent } from '@mdm/userArea/user-details/user-details.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedModule } from '../shared/shared.module';
import { UsersRoutesModule } from '../users-routes/users-routes.module';
import { ChangePasswordComponent } from '@mdm/userArea/change-password/change-password.component';
import { ApiKeysComponent } from '@mdm/userArea/api-keys/api-keys.component';

@NgModule({
  declarations: [
    UsersAppContainerComponent,
    ProfileComponent,
    ImgCroppieComponent,
    UserDetailsComponent,
    ChangePasswordComponent,
    ApiKeysComponent
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
