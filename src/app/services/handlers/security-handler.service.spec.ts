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
import { TestBed } from '@angular/core/testing';

import { SecurityHandlerService } from './security-handler.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UserDetails } from './security-handler.model';
import { cold } from 'jest-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginPayload } from '@maurodatamapper/mdm-resources';

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
    ['123', 'user@test.com', false],
    ['456', 'admin@test.com', true]
  ])('should sign in user %s %s when admin = %o', (id, userName, isAdmin) => {
    const credentials: LoginPayload = { username: userName, password: 'test' };
    const expectedUser: UserDetails = {
      id,
      userName,
      email: userName,
      firstName: 'first',
      lastName: 'last',
      isAdmin,
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

    resourcesStub.session.isApplicationAdministration.mockImplementationOnce(() => cold('--a|', {
      a: {
        body: {
          applicationAdministrationSession: expectedUser.isAdmin
        }
      }
    }));

    const expected$ = cold('----a|', { a: expectedUser });
    const actual$ = service.signIn(credentials);

    expect(actual$).toBeObservable(expected$);
  });

  it('should throw error if sign in fails', () => {
    resourcesStub.security.login.mockImplementationOnce(() => cold('--#', null, new HttpErrorResponse({})));

    const expected$ = cold('--#');
    const actual$ = service.signIn({ username: 'fail', password: 'fail' });
    expect(actual$).toBeObservable(expected$);
  });
});
