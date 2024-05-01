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
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { HtmlParserService } from './html-parser.service';
import { PathNameService } from '@mdm/shared/path-name/path-name.service';

describe('HtmlParserService', () => {
  let service: HtmlParserService;

  const pathNamesStub = {
    createHref: jest.fn() as jest.MockedFunction<(path: string) => string>
  };

  beforeEach(() => {
    service = setupTestModuleForService(HtmlParserService, {
      providers: [
        {
          provide: PathNameService,
          useValue: pathNamesStub
        }
      ]
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should ignore empty hrefs in links', () => {
    const content = '<a href="">No link</a>';
    const modified = service.parseAndModify(content);
    expect(modified).toStrictEqual(content);
  });

  it('should ignore empty fragment links', () => {
    const content = '<a href="#">Empty fragment</a>';
    const modified = service.parseAndModify(content);
    expect(modified).toStrictEqual(content);
  });

  it.each([
    'http://localhost',
    'https://www.google.com',
    'https://my.web.site/folder/page'
  ])('should ignore regular url %p', (url) => {
    const content = `<a href="${url}">Page link</a>`;
    const modified = service.parseAndModify(content);
    expect(modified).toStrictEqual(content);
  });

  it.each([
    ['dm:model', '/dataModels/dm:model'],
    ['dm:model|dc:class', '/dataModels/dm:model|dc:class'],
    ['dm:model|dc:class|de:element', '/dataModels/dm:model|dc:class|de:element']
  ])('should rewrite mauro item path %p to valid url %p', (path, pathUrl) => {
    const baseUrl = 'http://localhost/#/catalogue/item';
    pathNamesStub.createHref.mockImplementationOnce(
      () => `${baseUrl}${pathUrl}`
    );

    const content = `<a href="${path}">Mauro item link</a>`;
    const expected = `<a href="${baseUrl}${pathUrl}">Mauro item link</a>`;
    const modified = service.parseAndModify(content);
    expect(modified).toStrictEqual(expected);
  });
});
