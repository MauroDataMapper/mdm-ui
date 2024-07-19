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
import { TestBed } from '@angular/core/testing';

import { SecurityHandlerService } from './security-handler.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SignInError, UserDetails } from './security-handler.model';
import { cold } from 'jest-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginPayload, Securable } from '@maurodatamapper/mdm-resources';

interface MdmSecurityResourceStub {
  login: jest.Mock;
  logout: jest.Mock;
}

interface MdmSessionResourceStub {
  isApplicationAdministration: jest.Mock;
  isAuthenticated: jest.Mock;
}

interface MdmResourcesServiceStub {
  security: MdmSecurityResourceStub;
  session: MdmSessionResourceStub;
}

describe('SecurityHandlerService', () => {
  let service: SecurityHandlerService;
  const resourcesStub: MdmResourcesServiceStub = {
    security: {
      login: jest.fn(),
      logout: jest.fn()
    },
    session: {
      isApplicationAdministration: jest.fn(),
      isAuthenticated: jest.fn()
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService, useValue: resourcesStub
        },
        ElementTypesService
      ]
    });

    service = TestBed.inject(SecurityHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each([
    ['123', 'user@test.com'],
    ['456', 'admin@test.com']
  ])('should sign in user %s %s', (id, userName) => {
    const credentials: LoginPayload = { username: userName, password: 'test' };
    const expectedUser: UserDetails = {
      id,
      userName,
      email: userName,
      firstName: 'first',
      lastName: 'last',
      needsToResetPassword: false,
      role: '',
      token: undefined
    };

    resourcesStub.security.login.mockImplementationOnce(() => cold('--a|', {
      a: {
        body: {
          id: expectedUser.id,
          emailAddress: expectedUser.userName,
          firstName: expectedUser.firstName,
          lastName: expectedUser.lastName
        }
      }
  }));

    const expected$ = cold('--a|', { a: expectedUser });
    const actual$ = service.signIn(credentials);

    expect(actual$).toBeObservable(expected$);
  });

  it('should throw error if sign in fails', () => {
/*    let expectedResponse = new SignInError(new HttpErrorResponse({
      error: null,
      headers: new HttpHeaders({
        headers: null,
        lazyUpdate: null,
        normalizedNames: null
      })
    }))
    expectedResponse.type = SignInErrorType.UnknownError
*/
    resourcesStub.security.login.mockImplementationOnce(() => cold('--#', null, new SignInError(new HttpErrorResponse({}))));

    const expected$ = cold('--#', null, new SignInError(new HttpErrorResponse({})));
    const actual$ = service.signIn({ username: 'fail', password: 'fail' });
    expect(actual$).toBeObservable(expected$);
  });

  it('should return showPermission when element is editable after finalization', () => {
    const dataModel: Securable = {
      availableActions: ['finalisedEditActions']
    };
    const actual$ = service.elementAccess(
      dataModel
    );
   expect(actual$.showPermission).toBeTruthy();
  });
});
