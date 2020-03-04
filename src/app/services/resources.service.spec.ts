import { TestBed } from '@angular/core/testing';

import { ResourcesService } from './resources.service';
import { HttpClient } from '@angular/common/http';
import { AngularAngularjsLinkService } from './angular-angularjs-link.service';
import { Observable } from 'rxjs';
import { stringify } from 'querystring';
import { ValidatorService } from './validator.service';

describe('ResourcesService', () =>
{
    let spyLink: AngularAngularjsLinkService;
    let spyClient: HttpClient;
    let errorCode = 200;
    const testURL = "https://expected.com/api";

    let requestOptions = JSON.parse(JSON.stringify({
        "body": null,
        "headers": {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        },
        "withCredentials": true,
        "observe": "response"
    }));

    beforeEach(() =>
    {
        spyLink = <AngularAngularjsLinkService>{};
        spyLink.broadcast = jasmine.createSpy("broadcast");
        /**
         * Create a spy for HttpClient
         */
        spyClient = <HttpClient>{
            request: function (method: string, url: string, options: Object)
            {
                let observable$ = new Observable(observer =>
                {
                    console.log(url);
                    if (url) {
                        if (errorCode === 200) {
                            observer.next(url);
                            observer.complete();
                        } else {
                            observer.error({ "status": errorCode });
                        }
                    } else {
                        observer.error({ "status": 0 });
                    }
                });
                return observable$;
            }
        };

        spyOn(spyClient, "request").and.callThrough();

        TestBed.configureTestingModule({
            providers: [
                ResourcesService,
                { provide: HttpClient, useValue: spyClient },
                { provide: AngularAngularjsLinkService, useValue: spyLink }
            ]
        });
    });

    function prepareService(statusCode?: number)
    {
        const service = TestBed.get(ResourcesService);
        service.API = testURL;

        if (statusCode)
            errorCode = statusCode
        else
            errorCode = 200;

        return service;
    }

    function makeRequest(observable$, expectedResult?: string, expectedError?: string)
    {
        let result: string = null;

        observable$.subscribe(
            value =>
            {
                expect(result).toBeNull();

                expect(value).toEqual(expectedResult);
                result = value;
            },
            error =>
            {
                expect(result).toBeNull();

                if (expectedError)
                    expect(error).toEqual(expectedError);
                else
                    fail(`The error "${JSON.stringify(error)}" was not expected`)
                result = error;
            },
            () => expect(result).not.toBeNull()
        );
        return result;
    }

    function pluraliseClassname(classname: string): string
    {
        if (classname === "terminology")
            return "terminologies";
        if (classname === "authentication" || classname === "tree")
            return classname;

        return classname + "s";
    }

    function testGETRequest(id: string, path: string, action: string = 'action')
    {
        const service = prepareService();

        let expectedResult = service.API + `/${pluraliseClassname(path)}/${id}`;

        if (action)
            expectedResult = `${expectedResult}/${action}`;

        makeRequest(service[`${path}`].get(id, action, null), expectedResult);
        expect(spyClient.request).toHaveBeenCalledWith("GET", expectedResult, requestOptions);
    }

    function testPOSTRequest(id: string, path: string, action: string = "acton")
    {
        const service = prepareService();

        let valsvc = new ValidatorService();
        let cap = valsvc.capitalize(path);
        let expectedResult = service.API + `/${pluraliseClassname(path)}/`;

        if(id != null)
            expectedResult = `${expectedResult}${id}/`;

        let postRequest = JSON.parse(JSON.stringify(requestOptions));
        let data = JSON.parse('{"resource": {"id": ' + '"' + `resId${id}` + '"'
            + ', "label": "A New ' + valsvc.capitalize(path) + '", "description": "Lorem ipsum do"}}');

        postRequest.body = data.resource;

        makeRequest(service[`${path}`].post(id, null, data), expectedResult);
        expect(spyClient.request).toHaveBeenCalledWith("POST", expectedResult, postRequest);
    }

    function testPUTRequest(id: string, path: string, action: string = "action")
    {
        const service = prepareService();
        let valsvc = new ValidatorService();
        let cap = valsvc.capitalize(path);

        let expectedResult = service.API + `/${pluraliseClassname(path)}/${id}/`;
        let data = JSON.parse('{"resource": {"id": ' + '"' + `resId${id}` + '"'
            + ', "label": "A New ' + valsvc.capitalize(path) + '", "description": "Lorem ipsum do"}}');

        let putRequest = JSON.parse(JSON.stringify(requestOptions));
        putRequest.body = data.resource;

        makeRequest(service[`${path}`].put(id, null, data), expectedResult);
        expect(spyClient.request).toHaveBeenCalledWith("PUT", expectedResult, putRequest);
    }

    function testDELETERequest(id: string, path: string, action: string = "action")
    {
        const service = prepareService();

        let queryString = "permanent=true";
        let expectedResult = service.API + `/${pluraliseClassname(path)}/${id}/?${queryString}`;

        makeRequest(service[`${path}`].delete(id, null, queryString), expectedResult);
        expect(spyClient.request).toHaveBeenCalledWith("DELETE", expectedResult, requestOptions);
    }

    it('should GET a Folder', async () => testGETRequest("100", "folder"));
    it('should GET a Terminology', async () => testGETRequest("101", "terminology"))
    it('should GET a Classifier', async () => testGETRequest("102", "classifier"))
    it('should GET a CatalogueUser', async () => testGETRequest("103", "catalogueUser"))
    it('should GET a CatalogueItem', async () => testGETRequest("104", "catalogueItem"))
    it('should GET a UserGroup', async () => testGETRequest("105", "userGroup"))
    it('should GET a Authentication', async () => testGETRequest("106", "authentication", null))
    it('should GET a Tree', async () => testGETRequest("107", "tree"))

    it('should POST new Folder', async () => testPOSTRequest("200", "folder"))
    it('should POST new Terminology', async () => testPOSTRequest("201", "terminology"))
    it('should POST new CatalogueUser', async () => testPOSTRequest("202", "catalogueUser"))
    it('should POST new CatalogueItem', async () => testPOSTRequest("203", "catalogueItem"))
    it('should POST new UserGroup', async () => testPOSTRequest("204", "userGroup"))

    it('should PUT to a Folder', async () => testPUTRequest("300", "folder"))
    it('should PUT to a Terminology', async () => testPUTRequest("301", "terminology"))
    it('should PUT to a CatalogueUser', async () => testPUTRequest("302", "catalogueUser"))
    it('should PUT to a CatalogueItem', async () => testPUTRequest("303", "catalogueItem"))
    it('should PUT to a UserGroup', async () => testPUTRequest("304", "userGroup"))

    it('should DELETE a Folder', async () => testDELETERequest("400", "folder"))
    it('should DELETE a UserGroup', async () => testDELETERequest("401", "userGroup"))
});