import {Component, OnInit} from '@angular/core';
import {SecurityHandlerService} from '../../services/handlers/security-handler.service';
import {ResourcesService} from '../../services/resources.service';
import {MatDialogRef} from '@angular/material/dialog';
import { BroadcastService } from '../../services/broadcast.service';

@Component({
  selector: 'mdm-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.sass']
})
export class ForgotPasswordModalComponent implements OnInit {
  username: string;
  message: string;

  constructor(public broadcastService: BroadcastService, public dialogRef: MatDialogRef<ForgotPasswordModalComponent>, private securityHandler: SecurityHandlerService, private resources: ResourcesService) {}

  ngOnInit() {
    this.username = this.securityHandler.getEmailFromStorage();
  }

  resetPassword() {
    this.resources.catalogueUser.get(this.username, 'resetPasswordLink').subscribe(
      result => {
        this.message = 'success';
        this.dialogRef.close(this.username);
      },
      error => {
        this.message = 'error';
      }
    );
  }

  login() {
    this.dialogRef.close();
    this.broadcastService.broadcast('openLoginModalDialog');
  }
}
