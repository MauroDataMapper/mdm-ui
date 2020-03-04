import { Injectable, Inject } from '@angular/core';
import { IAngularEvent } from 'angular';
import { BroadcastService } from './broadcast.service';

@Injectable({
  providedIn: 'root'
})
export class AngularAngularjsLinkService {

    constructor(private broadcastSvc: BroadcastService) {}

    broadcast(name: string, ...args: any[]) {
       return this.broadcastSvc.broadcast(name, ...args);
    }

    on(name: string, listener: (event: IAngularEvent, ...args: any[]) => any) {
        this.broadcastSvc.subscribe(name, listener);
    }

}
