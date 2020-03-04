import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BroadcastService {

  constructor() { }
  private _handler: Subject<Message> = new Subject<Message>();

  broadcast(type: string, payload: any = null) {
    this._handler.next({ type, payload });
  }

  subscribe(type: string, callback: (payload: any) => void): Subscription {
    return this._handler
      .filter(message => message.type === type)
      .map(message => message.payload)
      .subscribe(callback);
  } 
}

export interface Message {
  type: string;
  payload: any;
}