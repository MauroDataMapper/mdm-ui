/*
Copyright 2021 University of Oxford

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
import { Observable } from 'rxjs';
import { LoadingService } from './loading.service';

/**
 * HTTP interceptor to track progress of each HTTP request.
 */
@Injectable()
export class HttpRequestProgressInterceptor implements HttpInterceptor {

  private requests: HttpRequest<any>[] = [];

  constructor(private loaderService: LoadingService) { }

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    this.loaderService.isLoading.next(this.requests.length > 0);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.isLoading.next(true);
    return Observable.create(observer => {
      const subscription = next.handle(request)
        .subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.removeRequest(request);
              observer.next(event);
            }
          },
          err => {
            this.removeRequest(request);
            observer.error(err);
          },
          () => {
            this.removeRequest(request);
            observer.complete();
          });
      // remove request from queue when cancelled
      return () => {
        this.removeRequest(request);
        subscription.unsubscribe();
      };
    });
  }

}