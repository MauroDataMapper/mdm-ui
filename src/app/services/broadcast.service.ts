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
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { BroadcastEvent, BroadcastMessage } from './broadcast.model';

/**
 * Service to broadcast events and data payloads to any other part of the application that subscribes to those events.
 */
@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  private handler = new Subject<BroadcastMessage<any>>();

  /**
   * Request an observable to subscribe to when a particular `BroadcastEvent` occurs.
   *
   * @typedef T The type of the event payload
   * @param event The `BroadcastEvent` type to watch.
   * @returns An `Observable<T>` to subscribe to for watching for these events.
   *
   * For any observable returned that is subscribed to, each must be correctly unsubscribed from when finished
   * to prevent memory leaks.
   */
   on<T>(event: BroadcastEvent): Observable<T> {
    return this.handler.pipe(
      filter(message => message.event === event),
      map(message => message.data)
    );
  }

  /**
   * Dispatch a new event to broadcast to any watchers.
   *
   * @typedef T The type of the event payload
   * @param event The `BroadcastEvent` type to broadcast.
   * @param data The optional payload that is associated with the event.
   */
  dispatch<T>(event: BroadcastEvent, data?: T) {
    this.handler.next(new BroadcastMessage(event, data));
  }
}
