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
import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { RegisterModalComponent } from './register-modal/register-modal.component';
import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';
import { BroadcastService } from '../services/broadcast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// eslint-disable-next-line no-shadow
export enum ModalType {
  Login,
  Register,
  ForgotPassword
}

@Injectable({
  providedIn: 'root'
})
export class ModalService implements OnDestroy {
  private unsubscribe$ = new Subject();

  constructor(
    private dialog: MatDialog,
    private broadcast: BroadcastService) { }

  init() {
    this.broadcast
      .on<any>('openLoginModalDialog')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(options => this.open(ModalType.Login, options));

    this.broadcast
      .on<any>('openRegisterModalDialog')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(options => this.open(ModalType.Register, options));

    this.broadcast
      .on<any>('openForgotPasswordModalDialog')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(options => this.open(ModalType.ForgotPassword, options));
  }

  open(modalType: ModalType, options?: MatDialogConfig) {
    switch (modalType) {
      case ModalType.Login:
        this.dialog.open(LoginModalComponent, options); break;
      case ModalType.Register:
        this.dialog.open(RegisterModalComponent, options); break;
      case ModalType.ForgotPassword:
        this.dialog.open(ForgotPasswordModalComponent, options); break;
      default:
        throw new Error('Modal not found');
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
