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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading = this.loadingSubject.asObservable();
  private loadingMap = new Map<string, boolean>();

  constructor() {}
  setHttpLoading(loading: boolean, url: string) {
    if (!url) {
      throw new Error(
        'The request URL must be provided to the LoadingService.setHttpLoading() function'
      );
    }

    if (loading === true) {
      this.loadingMap.set(url, loading);
      this.loadingSubject.next(true);
    } else if (loading === false && this.loadingMap.has(url)) {
      this.loadingMap.delete(url);
    }

    if (this.loadingMap.size === 0) {
      this.loadingSubject.next(false);
    }
  }
}
