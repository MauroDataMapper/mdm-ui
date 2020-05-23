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
import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  constructor() { }
  private handler: Subject<Message> = new Subject<Message>();

  broadcast(type: string, payload: any = null) {
    this.handler.next({ type, payload });
  }

  subscribe(type: string, callback: (payload: any) => void): Subscription {
    return this.handler.pipe(
      filter(message => message.type === type),
      map(message => message.payload)
    ).subscribe(callback);
  }
}

export interface Message {
  type: string;
  payload: any;
}
