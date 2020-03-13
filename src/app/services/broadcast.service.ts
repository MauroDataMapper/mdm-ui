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
