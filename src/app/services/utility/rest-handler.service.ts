import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { StateHandlerService } from '../handlers/state-handler.service';
import { BroadcastService } from '../broadcast.service';
import { MessageService } from '../message.service';

@Injectable({
    providedIn: 'root'
})
export class RestHandlerService {
    serverError = new Subject<any>();


    constructor(private messageService: MessageService, private http: HttpClient, private broadcastSvc: BroadcastService, private stateHandler: StateHandlerService) { }

    restHandler(options: any) {
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


        return this.http.request(options.method, options.url, {
            body: options.data,
            headers: options.headers,
            withCredentials: options.withCredentials,
            observe: 'response',
            responseType: options.responseType
        }).pipe(
          catchError(response => {
            if (response.status === 0 || response.status === -1) {
                this.stateHandler.ApplicationOffline();
                this.broadcastSvc.broadcast('applicationOffline', response);
            } else if (response.status === 401) {
                this.stateHandler.NotAuthorized(response);
                this.messageService.lastError = response;
            } else if (response.status === 404) {
                this.stateHandler.NotFound(response);
                this.messageService.lastError = response;
            } else if (response.status === 501) {
                this.stateHandler.NotImplemented(response);
                this.messageService.lastError = response;
            } else if (response.status >= 400 && response.status < 500 && options.method === 'GET') {
                this.stateHandler.NotFound(response);
                this.broadcastSvc.broadcast('resourceNotFound', response);
                this.messageService.lastError = response;
            } else if (response.status >= 500) {
                this.messageService.lastError = response;
                this.stateHandler.ServerError(response);
            }
            return throwError(response);
          })
        );
  }
}
