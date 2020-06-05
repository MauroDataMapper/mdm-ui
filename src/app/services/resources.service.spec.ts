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
import { TestBed } from '@angular/core/testing';

import { ResourcesService } from './resources.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { stringify } from 'querystring';
import { ValidatorService } from './validator.service';

describe('ResourcesService', () => {
    let spyClient: HttpClient;
    let errorCode = 200;
    const testURL = 'https://expected.com/api';

    const requestOptions = JSON.parse(JSON.stringify({
        body: null,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache'
        },
        withCredentials: true,
        observe: 'response'
    }));

    beforeEach(() => {
        /**
         * Create a spy for HttpClient
         */

    });

    function prepareService(statusCode?: number) {
        const service = TestBed.inject(ResourcesService);
        service.API = testURL;

        if (statusCode) {
          errorCode = statusCode;
        } else {
          errorCode = 200;
        }
        return service;
    }

    function makeRequest(observable$, expectedResult?: string, expectedError?: string) {
        let result: string = null;

        observable$.subscribe(
            value => {
                expect(result).toBeNull();

                expect(value).toEqual(expectedResult);
                result = value;
            },
            error => {
                expect(result).toBeNull();

                if (expectedError) {
                    expect(error).toEqual(expectedError);
                } else {
                    fail(`The error "${JSON.stringify(error)}" was not expected`);
                }
                result = error;
            },
            () => expect(result).not.toBeNull()
        );
        return result;
    }

    function pluraliseClassname(classname: string): string {
        if (classname === 'terminology') {
          return 'terminologies';
        }
        if (classname === 'authentication' || classname === 'tree') {
          return classname;
        }

        return classname + 's';
    }

    function testGETRequest(id: string, path: string, action: string = 'action') {
        const service = prepareService();

        let expectedResult = service.API + `/${pluraliseClassname(path)}/${id}`;

        if (action) {
            expectedResult = `${expectedResult}/${action}`;
        }

        makeRequest(service[`${path}`].get(id, action, null), expectedResult);
        expect(spyClient.request).toHaveBeenCalledWith('GET', expectedResult, requestOptions);
    }

    function testPOSTRequest(id: string, path: string, action: string = 'acton') {
        const service = prepareService();

        const valsvc = new ValidatorService();
        const cap = valsvc.capitalize(path);
        let expectedResult = service.API + `/${pluraliseClassname(path)}/`;

        if (id != null) {
            expectedResult = `${expectedResult}${id}/`;
        }

        const postRequest = JSON.parse(JSON.stringify(requestOptions));
        const data = JSON.parse('{"resource": {"id": ' + '"' + `resId${id}` + '"'
            + ', "label": "A New ' + valsvc.capitalize(path) + '", "description": "Lorem ipsum do"}}');

        postRequest.body = data.resource;

        makeRequest(service[`${path}`].post(id, null, data), expectedResult);
        expect(spyClient.request).toHaveBeenCalledWith('POST', expectedResult, postRequest);
    }

    function testPUTRequest(id: string, path: string, action: string = 'action') {
        const service = prepareService();
        const valsvc = new ValidatorService();
        const cap = valsvc.capitalize(path);

        const expectedResult = service.API + `/${pluraliseClassname(path)}/${id}/`;
        const data = JSON.parse('{"resource": {"id": ' + '"' + `resId${id}` + '"'
            + ', "label": "A New ' + valsvc.capitalize(path) + '", "description": "Lorem ipsum do"}}');

        const putRequest = JSON.parse(JSON.stringify(requestOptions));
        putRequest.body = data.resource;

        makeRequest(service[`${path}`].put(id, null, data), expectedResult);
        expect(spyClient.request).toHaveBeenCalledWith('PUT', expectedResult, putRequest);
    }

    function testDELETERequest(id: string, path: string, action: string = 'action') {
        const service = prepareService();

        const queryString = 'permanent=true';
        const expectedResult = service.API + `/${pluraliseClassname(path)}/${id}/?${queryString}`;

        makeRequest(service[`${path}`].delete(id, null, queryString), expectedResult);
        expect(spyClient.request).toHaveBeenCalledWith('DELETE', expectedResult, requestOptions);
    }

    it('should GET a Folder', async () => testGETRequest('100', 'folder'));
    it('should GET a Terminology', async () => testGETRequest('101', 'terminology'));
    it('should GET a Classifier', async () => testGETRequest('102', 'classifier'));
    it('should GET a CatalogueUser', async () => testGETRequest('103', 'catalogueUser'));
    it('should GET a CatalogueItem', async () => testGETRequest('104', 'catalogueItem'));
    it('should GET a UserGroup', async () => testGETRequest('105', 'userGroup'));
    it('should GET a Authentication', async () => testGETRequest('106', 'authentication', null));
    it('should GET a Tree', async () => testGETRequest('107', 'tree'));

    it('should POST new Folder', async () => testPOSTRequest('200', 'folder'));
    it('should POST new Terminology', async () => testPOSTRequest('201', 'terminology'));
    it('should POST new CatalogueUser', async () => testPOSTRequest('202', 'catalogueUser'));
    it('should POST new CatalogueItem', async () => testPOSTRequest('203', 'catalogueItem'));
    it('should POST new UserGroup', async () => testPOSTRequest('204', 'userGroup'));

    it('should PUT to a Folder', async () => testPUTRequest('300', 'folder'));
    it('should PUT to a Terminology', async () => testPUTRequest('301', 'terminology'));
    it('should PUT to a CatalogueUser', async () => testPUTRequest('302', 'catalogueUser'));
    it('should PUT to a CatalogueItem', async () => testPUTRequest('303', 'catalogueItem'));
    it('should PUT to a UserGroup', async () => testPUTRequest('304', 'userGroup'));

    it('should DELETE a Folder', async () => testDELETERequest('400', 'folder'));
    it('should DELETE a UserGroup', async () => testDELETERequest('401', 'userGroup'));
});
