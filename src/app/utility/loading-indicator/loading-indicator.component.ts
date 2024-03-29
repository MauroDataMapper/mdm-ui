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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingService } from '@mdm/services/loading.service';
import { Subject } from 'rxjs';
import { delay, map, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mdm-loading-indicator',
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.scss']
})
export class LoadingIndicatorComponent implements OnInit, OnDestroy {
  visible = false;

  private unsubscribe$ = new Subject<void>();

  constructor(private loading: LoadingService) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    // Fix to avoid "ExpressionChangedAfterItHasBeenCheckedError" debugging error
    // See https://blog.angular-university.io/angular-debugging/
    this.loading.isLoading
      .pipe(
        takeUntil(this.unsubscribe$),
        startWith(false),
        delay(0),
        map((value) => (this.visible = value))
      )
      .subscribe();
  }
}
