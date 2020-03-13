import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { ResourcesService } from '../services/resources.service';
import { StateService } from '@uirouter/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  errors = [];
  confirmed = false;
  processing = false;
  message: string;
  user = {
    password: '',
    confirmPassword: ''
  };
  uid: any;
  token: any;

  constructor(
    private title: Title,
    private stateHandler: StateHandlerService,
    private resources: ResourcesService,
    private stateService: StateService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.title.setTitle('Reset Password');
    this.uid = this.stateService.params.uid;
    this.token = this.stateService.params.token;

    if (!this.uid || !this.token || this.sharedService.isLoggedIn()) {
      this.stateHandler.Go('home');
    }
  }

  validate = () => {
    this.errors = [];
    let isValid = true;

    if (this.user.password.trim().length < 4) {
      this.errors['password'] = 'Password must be at least 4 characters long!';
      isValid = false;
    }
    if (this.user.password.trim() !== this.user.confirmPassword.trim()) {
      this.errors['password'] = ' ';
      this.errors['confirmPassword'] = 'These passwords don\'t match';
      isValid = false;
    }
    if (isValid) {
      delete this.errors;
    }
    return isValid;
  };

  cancel = () => {
    this.stateHandler.Go('home');
  };

  save = () => {
    if (!this.validate()) {
      return;
    }

    const resource = {
      newPassword: this.user.password.trim(),
      resetToken: this.token
    };

    this.processing = true;
    this.resources.catalogueUser
      .put(this.uid, 'changePassword', { resource })
      .subscribe(
        result => {
          this.message = 'success';
          this.stateHandler.Go('home');
        },
        error => {
          this.message = 'error';
          this.processing = false;
          this.confirmed = false;
        }
      );
  }
}
