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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginModalComponent } from './login-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SecurityHandlerService } from '@mdm/services';
import { of } from 'rxjs';
import { UserDetails } from '@mdm/services/handlers/security-handler.model';

interface SecurityHandlerServiceStub {
  signIn: jest.Mock;
}

describe('LoginModalComponent', () => {
  let component: LoginModalComponent;
  let fixture: ComponentFixture<LoginModalComponent>;

  const securityHandler: SecurityHandlerServiceStub = {
    signIn: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        },
        {
          provide: SecurityHandlerService,
          useValue: securityHandler
        }
      ],
      declarations: [
        LoginModalComponent
      ]
    }).compileComponents();
  });

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
      expect(component.signInForm).toBeTruthy();
    });
  });

  describe('Test: Login form', () => {

    it.each([
      ['', ''],
      ['test', ''],
      ['test@test.com', ''],
      ['', 'password'],
      ['test', 'password']
    ])('should not submit invalid data - username: "%s", password: "%s"', (userName, password) => {
      const spy = jest.spyOn(securityHandler, 'signIn');
      component.signInForm.setValue({ userName, password });
      component.login();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should submit valid data', () => {
      securityHandler.signIn.mockImplementationOnce(() => of<UserDetails>({
        id: '123',
        firstName: 'test',
        lastName: 'test',
        userName: 'test@test.com'
      }));
      const spy = jest.spyOn(securityHandler, 'signIn');
      component.signInForm.setValue({ userName: 'test@test.com', password: 'password' });
      component.login();
      expect(spy).toHaveBeenCalled();
    });
  });
});
