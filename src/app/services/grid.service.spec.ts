/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { SortDirection } from '@angular/material/sort';
import { setupTestModuleForService } from '@mdm/testing/testing.helpers';
import { GridService } from './grid.service';

describe('GridService', () => {
  let service: GridService;

  beforeEach(() => {
    service = setupTestModuleForService(GridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('construct options', () => {
    it.each<
      [
        number | undefined,
        number | undefined,
        string | undefined,
        SortDirection | undefined
      ]
    >([
      [10, 0, undefined, undefined],
      [20, 3, undefined, undefined],
      [undefined, undefined, 'name', 'asc'],
      [undefined, undefined, 'desc', 'desc'],
      [50, undefined, 'name', 'asc'],
      [25, 4, 'label', 'desc']
    ])(
      'should construct options for pageSize: %p, pageIndex: %p, sortBy: %p, sortType: %p',
      (pageSize, pageIndex, sortBy, sortType) => {
        const expected = {
          ...(pageSize && { max: pageSize }),
          ...(pageIndex && { offset: pageIndex }),
          ...(sortBy && { sort: sortBy }),
          ...(sortType && { order: sortType })
        };

        const actual = service.constructOptions(
          pageSize,
          pageIndex,
          sortBy,
          sortType
        );

        expect(actual).toStrictEqual(expected);
      }
    );

    it.each([
      { label: 'test' },
      { description: 'start' },
      { label: 'test', description: 'something' }
    ])('should construct options with filters %p', (filters) => {
      const expected = {
        ...filters
      };

      const actual = service.constructOptions(null, null, null, null, filters);

      expect(actual).toStrictEqual(expected);
    });

    it.each(['test+', 'test[1]', 'test&another', 'money$', 'question?'])(
      'should construct URL encoded filters for value %p',
      (filter) => {
        const expected = {
          test: encodeURIComponent(filter)
        };

        const actual = service.constructOptions(null, null, null, null, {
          test: filter
        });

        expect(actual).toStrictEqual(expected);
      }
    );
  });
});
