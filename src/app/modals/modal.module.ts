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
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
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
import { SharedModule } from '@mdm/shared/shared.module';
import { AddRuleRepresentationModalComponent } from './add-rule-representation-modal/add-rule-representation-modal.component';
import { AddRuleModalComponent } from './add-rule-modal/add-rule-modal.component';
import { ApiKeysModalComponent } from './api-keys-modal/api-keys-modal.component';
import { SecurityModalComponent } from './security-modal/security-modal.component';
import { AddProfileModalComponent } from './add-profile-modal/add-profile-modal.component';
import { EditProfileModalComponent } from './edit-profile-modal/edit-profile-modal.component';
import { CatalogueModule } from '@mdm/modules/catalogue/catalogue.module';
import { AceConfigInterface, AceModule, ACE_CONFIG } from 'ngx-ace-wrapper';
import { MarkupDisplayModalComponent } from './markup-display-modal/markup-display-modal.component';
import { DefaultProfileEditorModalComponent } from './default-profile-editor-modal/default-profile-editor-modal.component';
import { PipesModule } from '@mdm/modules/pipes/pipes.module';
import { ChangeBranchNameModalComponent } from './change-branch-name-modal/change-branch-name-modal.component';
import { CatalogueItemSelectModalComponent } from './catalogue-item-select-modal/catalogue-item-select-modal.component';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { ExportModelDialogComponent } from './export-model-dialog/export-model-dialog.component';
import { ChangeLabelModalComponent } from './change-label-modal/change-label-modal.component';

const defaultAceConfig: AceConfigInterface = {};

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
    PipesModule,
    FoldersTreeModule
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
    DefaultProfileEditorModalComponent,
    ChangeBranchNameModalComponent,
    CatalogueItemSelectModalComponent,
    ExportModelDialogComponent,
    ChangeLabelModalComponent
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
    ConfirmationModalComponent,
    ChangeBranchNameModalComponent,
    ExportModelDialogComponent
  ]
})
export class ModalModule {
  constructor(private modalService: ModalService) {
    modalService.init();
  }
}
