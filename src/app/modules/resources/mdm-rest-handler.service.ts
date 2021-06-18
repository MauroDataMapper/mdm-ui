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
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdmRestHandler, RequestSettings } from '@maurodatamapper/mdm-resources';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { MessageService } from '@mdm/services/message.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * An IMdmRestHandler implemented using Angular's HttpClient.
 */
@Injectable()
export class MdmRestHandlerService implements MdmRestHandler {
  constructor(
    private messageService: MessageService,
    private http: HttpClient,
    private broadcast: BroadcastService,
    private stateHandler: StateHandlerService) { }

  process(url: string, options: RequestSettings) {
    if (options.withCredentials === undefined ||
      options.withCredentials === null ||
      (options.withCredentials !== undefined && options.withCredentials === false)) {
      throw new Error('withCredentials is not provided!');
    }

    if (options.responseType) { } else {
      options.responseType = undefined;
    }

    options.headers = options.headers || {};
    // STOP IE11 from Caching HTTP GET
    options.headers['Cache-Control'] = 'no-cache';
    options.headers.Pragma = 'no-cache';

    // For any GET requests that return 4XX response, automatically handle them unless overridden
    const handleGetErrors: boolean = options?.handleGetErrors ?? true;

    return this.http.request(options.method, url, {
      body: options.body,
      headers: options.headers,
      withCredentials: options.withCredentials,
      observe: 'response',
      responseType: options.responseType
    }).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.status === 0 || response.status === -1) {
          this.broadcast.applicationOffline(response);
        }
        else if (response.status === 401) {
          this.messageService.lastError = response;
          if (options.login === undefined) {
            this.stateHandler.NotAuthorized(response);
          }
        }
        else if (response.status === 504) {
          this.messageService.lastError = response;
          this.stateHandler.ServerTimeout();
        }
        else if (response.status === 404 && options.method === 'GET' && handleGetErrors) {
          this.messageService.lastError = response;
          this.stateHandler.NotFound(response);
        }
        else if (response.status === 501) {
          this.messageService.lastError = response;
          this.stateHandler.NotImplemented(response);
        }
        else if (response.status >= 400 && response.status < 500 && options.method === 'GET' && handleGetErrors) {
          this.messageService.lastError = response;
          this.stateHandler.NotFound(response);
          // this.broadcastSvc.broadcast('resourceNotFound', response);
        }
        else if (response.status >= 500) {
          this.messageService.lastError = response;
          this.stateHandler.ServerError(response);
        }
        return throwError(response);
      })
    );
  }
}
