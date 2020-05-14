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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatPasswordStrengthModule
  ],
  declarations: [
    RegisterModalComponent,
    LoginModalComponent,
    ForgotPasswordModalComponent,
    ConfirmationModalComponent,
    InputModalComponent
  ],
  providers: [
    ModalService
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
