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

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoadingService } from './loading.service';

/**
 * HTTP interceptor to track progress of each HTTP request.
 */
@Injectable()
export class HttpRequestProgressInterceptor implements HttpInterceptor {

  private requests: HttpRequest<any>[] = [];

  constructor(private loading: LoadingService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loading.setHttpLoading(true, request.url);
    return next
      .handle(request)
      .pipe(
        catchError(error => {
          this.loading.setHttpLoading(false, request.url);
          return throwError(error);
        })
      )
      .pipe(
        map((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.loading.setHttpLoading(false, request.url);
          }
          return event;
        })
      );
  }

}