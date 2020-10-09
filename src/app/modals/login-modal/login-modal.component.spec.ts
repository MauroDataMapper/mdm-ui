/*
Copyright 2020 University of Oxford

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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { LoginModalComponent } from './login-modal.component';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BroadcastService } from '@mdm/services';


describe('LoginModalComponent', () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;
  // tslint:disable: prefer-const
  let broadcastServiceMock: BroadcastService;
  let dialogRefMock;
  let securityHandler;
  let messageServiceMock;
  let validatorServiceMock;

  beforeEach(() => {
    component = new LoginModalComponent(
      broadcastServiceMock,
      dialogRefMock,
      securityHandler,
      messageServiceMock,
      validatorServiceMock
    );
    component.ngOnInit();
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        {
          provide: MdmResourcesService, useValue: {}
        }
      ],
      declarations: [
        ProfilePictureComponent,
        ByteArrayToBase64Pipe,
        LoginModalComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Test: ngOnInit', () => {
    it('should initialize the form', () => {
      const res = {
        username: '',
        password: ''
      };
      expect(component.resource).toEqual(res);
    });
  });


  describe('Test: Login form', () => {
    it('Test: Login form SHOULD submit the login form', () => {
      const generateSpy = jest.spyOn(component, 'returnSecurityHandler');
      component.username = 'email@email.com';
      component.password = 'password';
      component.login();
      expect(generateSpy).toHaveBeenCalled();
    });

    it('Test: Login form SHOULD NOT submit the login form (1)', () => {
      const generateSpy = jest.spyOn(component, 'returnSecurityHandler');
      component.username = '';
      component.password = '';
      component.login();
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('Test: Login form SHOULD NOT submit the login form (2)', () => {
      const generateSpy = jest.spyOn(component, 'returnSecurityHandler');
      component.username = 'abc';
      component.password = 'abc';
      component.login();
      expect(generateSpy).not.toHaveBeenCalled();
    });


    it('Test: Login form SHOULD NOT submit the login form (3)', () => {
      const generateSpy = jest.spyOn(component, 'returnSecurityHandler');
      component.username = 'email@email.com';
      component.password = '';
      component.login();
      expect(generateSpy).not.toHaveBeenCalled();
    });

    it('Test: Login form SHOULD NOT submit the login form (4)', () => {
      const generateSpy = jest.spyOn(component, 'returnSecurityHandler');
      component.username = '';
      component.password = 'password';
      component.login();
      expect(generateSpy).not.toHaveBeenCalled();
    });
  });
});
