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

import { RestHandlerService } from './rest-handler.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';

/* eslint-disable prefer-arrow/prefer-arrow-functions */
describe('RestHandlerService', () => {
  let errorCode = 200;
  let spyClient: HttpClient;

  beforeEach(() => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    /**
     * Create a spy for HttpClient
     */
    spyClient = {
      request(method: string, url: string) {
        const observable$ = new Observable(observer => {
          if (url) {
            if (errorCode === 200) {
              observer.next('this is the next result');
              observer.complete();
            } else {
              const resp = {
                status: errorCode
              };
              observer.error(resp);
            }
          } else {
            const resp = {
              status: 0
            };
            observer.error(resp);
          }
        });
        return observable$;
      }
    } as HttpClient;
    TestBed.configureTestingModule({
      imports: [
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        RestHandlerService,
        { provide: HttpClient, useValue: spyClient }
      ]
    }).compileComponents();
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function makeRequest(errorNumber: number, expectSuccess: boolean, options?: any) {

    if (!options) {
      options = {
        url: 'http://localhost:8080/api/folders/a61e88e7-c951-4624-baaf-ec03cd09357b/',
        method: 'GET',
        data: null,
        login: false,
        withCredentials: true,
      };
    }
    const service: RestHandlerService = TestBed.inject(RestHandlerService);

    let somethingHappened = false;
    errorCode = errorNumber;

    service.restHandler(options).subscribe(() => {
        if (!expectSuccess) {
          fail('Should not have succeeded');
        } else {
          somethingHappened = true;
        }
      },
     () => {
        if (expectSuccess) {
          fail('Should not have received an error');
        } else {
          somethingHappened = true;
        }
      },
      () => {
        expect(somethingHappened).toEqual(true);
      }
    );
    expect(somethingHappened).toEqual(true);
  }

  it('should be created', () => {
    const service: RestHandlerService = TestBed.inject(RestHandlerService);
    expect(service).toBeTruthy();
  });

  // COMMENTED OUT UNTIL MOCKS CREATED
  // it('should work', async(() => {
  //   makeRequest(200, true);
  //   // expect(spyLink.broadcast).not.toHaveBeenCalled();
  // }));

  // it('should not find the page', async(() => {
  //   makeRequest(404, false);
  //   // expect(spyLink.broadcast).toHaveBeenCalledWith("resourceNotFound", {status: 404});
  // }));

  // it('should be unauthorised', async(() => {
  //   makeRequest(401, false);
  //   // expect(spyLink.broadcast).toHaveBeenCalledWith("notAuthenticated", {status: 401});
  // }));

  // it('should find a dead server', async(() => {
  //   makeRequest(0, false);
  //   // expect(spyLink.broadcast).toHaveBeenCalledWith("applicationOffline", {status: 0});
  // }));

  // it('should get a server error', async(() => {
  //   makeRequest(500, false);
  //   // expect(spyLink.broadcast).toHaveBeenCalledWith("serverError", {status: 500});
  // }));

  // it('should get a not implemented error', async(() => {
  //   makeRequest(501, false);
  //   // expect(spyLink.broadcast).toHaveBeenCalledWith("notImplemented", {status: 501});
  // }));

  // it('should object to missing credentials', () => {
  //   const service: RestHandlerService = TestBed.inject(RestHandlerService);

  //   const options: any = { };
  //   expect(() => service.restHandler(options)).toThrowError();
  //   options.withCredentials = false;
  //   expect(() => service.restHandler(options)).toThrowError();
  //   options.withCredentials = true;
  //   service.restHandler(options);
  // });
});
