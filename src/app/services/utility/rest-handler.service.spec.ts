import { TestBed, async } from '@angular/core/testing';

import { RestHandlerService } from './rest-handler.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AngularAngularjsLinkService } from '../angular-angularjs-link.service';

describe('RestHandlerService', () => {
    let errorCode = 200;
    let spyClient: HttpClient;
    let spyLink: AngularAngularjsLinkService;

    beforeEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
        /**
         * Create a spy for HttpClient
         */
        spyClient = <HttpClient>{
            request: function (method: string, url: string, options: {}) {
                let observable$ = new Observable(observer => {
                    if (url) {
                        if (errorCode === 200) {
                            observer.next("this is the next result");
                            observer.complete();
                        } else {
                            let resp = {
                                "status": errorCode
                            }
                            observer.error(resp);
                        }
                    } else {
                        let resp = {
                            "status": 0
                        }
                        observer.error(resp);
                    }
                });
                return observable$;
            }
        };

        spyLink = <AngularAngularjsLinkService>{};
        spyLink.broadcast = jasmine.createSpy("broadcast");

        TestBed.configureTestingModule({
            providers: [
                RestHandlerService,
                { provide: HttpClient, useValue: spyClient },
                { provide: AngularAngularjsLinkService, useValue: spyLink}
            ]
        }).compileComponents();
    });

    function makeRequest(errorNumber: number, expectSuccess: boolean,
        options?: any) {

        if (!options) {
            options = {
                "url": "http://localhost:8080/api/folders/a61e88e7-c951-4624-baaf-ec03cd09357b/",
                "method": "GET",
                "data": null,
                "login": false,
                "withCredentials": true,
            }
        }
        const service: RestHandlerService = TestBed.get(RestHandlerService);

        let somethingHappened: boolean = false;
        errorCode = errorNumber;

        service.restHandler(options).subscribe(
            value => {
                if(!expectSuccess)
                    fail("Should not have succeeded");
                else 
                    somethingHappened = true;
            },
            err => {
                if(expectSuccess)
                    fail("Should not have received an error");
                else
                    somethingHappened = true;
            },
            () => {
                expect(somethingHappened).toEqual(true);
            }
        );
        expect(somethingHappened).toEqual(true);
    }

    it('should be created', () => {
        const service: RestHandlerService = TestBed.get(RestHandlerService);
        expect(service).toBeTruthy();
    });

    it('should work', async(() => {
        makeRequest(200, true);
        expect(spyLink.broadcast).not.toHaveBeenCalled();
    }));

    it('should not find the page', async(() => {
        makeRequest(404, false);
        expect(spyLink.broadcast).toHaveBeenCalledWith("resourceNotFound", {status: 404});
    }));

    it('should be unauthorised', async(() => {
        makeRequest(401, false);
        expect(spyLink.broadcast).toHaveBeenCalledWith("notAuthenticated", {status: 401});
    }));

    it('should find a dead server', async(() => {
        makeRequest(0, false);
        expect(spyLink.broadcast).toHaveBeenCalledWith("applicationOffline", {status: 0});
    }));

    it('should get a server error', async(() => {
        makeRequest(500, false);
        expect(spyLink.broadcast).toHaveBeenCalledWith("serverError", {status: 500});
    }));

    it('should get a not implemented error', async(() => {
        makeRequest(501, false);
        expect(spyLink.broadcast).toHaveBeenCalledWith("notImplemented", {status: 501});
    }));

    it("should object to missing credentials", () => {
        const service: RestHandlerService = TestBed.get(RestHandlerService);
        
        let options = {};
        expect(() => service.restHandler(options)).toThrowError();
        options["withCredentials"] = false;
        expect(() => service.restHandler(options)).toThrowError();
        options["withCredentials"] = true;
        service.restHandler(options);
    });
});
