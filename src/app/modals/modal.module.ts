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
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { RegisterModalComponent } from './register-modal/register-modal.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { ModalService } from './modal.service';
import { InputModalComponent } from './input-modal/input-modal.component';
import { NewFolderModalComponent } from './new-folder-modal/new-folder-modal.component';
import { MaterialModule } from '@mdm/modules/material/material.module';
import { FinaliseModalComponent } from './finalise-modal/finalise-modal.component';
import { CheckInModalComponent } from './check-in-modal/check-in-modal.component';
import { ResolveMergeConflictModalComponent } from './resolve-merge-conflict-modal/resolve-merge-conflict-modal.component';
import { SharedModule } from '@mdm/modules/shared/shared.module';
import { AddRuleRepresentationModalComponent } from './add-rule-representation-modal/add-rule-representation-modal.component';
import { AddRuleModalComponent } from './add-rule-modal/add-rule-modal.component';
import { ApiKeysModalComponent } from './api-keys-modal/api-keys-modal.component';
import { SecurityModalComponent } from './security-modal/security-modal.component';
import { AddProfileModalComponent } from './add-profile-modal/add-profile-modal.component';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';
import { CatalogueModule } from '@mdm/modules/catalogue/catalogue.module';
import {  AceConfigInterface, AceModule, ACE_CONFIG } from 'ngx-ace-wrapper';
import { MarkupDisplayModalComponent } from './markup-display-modal/markup-display-modal.component';
import { DefaultProfileEditorModalComponent } from './default-profile-editor-modal/default-profile-editor-modal.component';
import { PipesModule } from '@mdm/modules/pipes/pipes.module';

const defaultAceConfig: AceConfigInterface = {
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatPasswordStrengthModule,
    MaterialModule,
    SharedModule,
    AceModule,
    CatalogueModule,
    PipesModule
  ],
  declarations: [
    RegisterModalComponent,
    LoginModalComponent,
    ForgotPasswordModalComponent,
    ConfirmationModalComponent,
    InputModalComponent,
    NewFolderModalComponent,
    FinaliseModalComponent,
    CheckInModalComponent,
    ResolveMergeConflictModalComponent,
    AddRuleRepresentationModalComponent,
    AddRuleModalComponent,
    ApiKeysModalComponent,
    SecurityModalComponent,
    AddProfileModalComponent,
    EditProfileModalComponent,
    ResolveMergeConflictModalComponent,
    AddRuleRepresentationModalComponent,
    AddRuleModalComponent,
    ApiKeysModalComponent,
    MarkupDisplayModalComponent,
    DefaultProfileEditorModalComponent
  ],
  providers: [
    ModalService,
    {
      provide: ACE_CONFIG,
      useValue: defaultAceConfig
    }
  ],
  exports: [
    RegisterModalComponent,
    LoginModalComponent,
    ForgotPasswordModalComponent,
    ConfirmationModalComponent
  ]
})
export class ModalModule {
  constructor(private modalService: ModalService) {
    modalService.init();
  }
}
