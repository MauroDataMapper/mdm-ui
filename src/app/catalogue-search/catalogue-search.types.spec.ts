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
import { ProfileField, ProfileSummary } from '@maurodatamapper/mdm-resources';
import {
  CatalogueSearchProfileFilter,
  deserializeProfileFiltersToDto,
  mapProfileFiltersToDto,
  serializeProfileFiltersDto,
  ungroupProfileFiltersDto
} from './catalogue-search.types';

describe('catalogue-search.types', () => {
  describe('profile filters', () => {
    const namespace1 = 'test.namespace.1';
    const namespace2 = 'test.namespace.2';

    const profile1 = 'TestProfile1';
    const profile2 = 'TestProfile2';

    const version1 = '1.0.0';
    const version2 = '2.0.0';

    const key1 = 'key1';
    const key2 = 'key2';

    const value1 = 'value1';
    const value2 = 'value2';

    const buildProfileFilter = (
      namespace: string,
      name: string,
      version: string,
      key: string,
      value: string
    ): CatalogueSearchProfileFilter => {
      return {
        provider: {
          namespace,
          name,
          version
        } as ProfileSummary,
        key: {
          metadataPropertyName: key
        } as ProfileField,
        value
      };
    };

    describe('mapProfileFiltersToDto', () => {
      it('should map a single namespace and field to a DTO', () => {
        const filters = [
          buildProfileFilter(namespace1, profile1, version1, key1, value1)
        ];

        const expected = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1
          }
        };

        const actual = mapProfileFiltersToDto(filters);
        expect(actual).toStrictEqual(expected);
      });

      it('should map a single namespace and multiple fields to a DTO', () => {
        const filters = [
          buildProfileFilter(namespace1, profile1, version1, key1, value1),
          buildProfileFilter(namespace1, profile1, version1, key2, value2)
        ];

        const expected = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1,
            [key2]: value2
          }
        };

        const actual = mapProfileFiltersToDto(filters);
        expect(actual).toStrictEqual(expected);
      });

      it('should map multiple namespaces and multiple fields to a DTO', () => {
        const filters = [
          buildProfileFilter(namespace1, profile1, version1, key1, value1),
          buildProfileFilter(namespace1, profile1, version1, key2, value2),
          buildProfileFilter(namespace2, profile2, version2, key1, value1),
          buildProfileFilter(namespace2, profile2, version2, key2, value2)
        ];

        const expected = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1,
            [key2]: value2
          },
          [`${namespace2}|${profile2}|${version2}`]: {
            [key1]: value1,
            [key2]: value2
          }
        };

        const actual = mapProfileFiltersToDto(filters);
        expect(actual).toStrictEqual(expected);
      });
    });

    describe('ungroupProfileFiltersDto', () => {
      it('should unmap a single namespace and field', () => {
        const dto = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1
          }
        };

        const expected = [
          {
            namespace: namespace1,
            name: profile1,
            version: version1,
            key: key1,
            value: value1
          }
        ];

        const actual = ungroupProfileFiltersDto(dto);
        expect(actual).toStrictEqual(expected);
      });

      it('should unmap a single namespace and multiple fields', () => {
        const dto = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1,
            [key2]: value2
          }
        };

        const expected = [
          {
            namespace: namespace1,
            name: profile1,
            version: version1,
            key: key1,
            value: value1
          },
          {
            namespace: namespace1,
            name: profile1,
            version: version1,
            key: key2,
            value: value2
          }
        ];

        const actual = ungroupProfileFiltersDto(dto);
        expect(actual).toStrictEqual(expected);
      });

      it('should unmap multiple namespaces and multiple fields', () => {
        const dto = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1,
            [key2]: value2
          },
          [`${namespace2}|${profile2}|${version2}`]: {
            [key1]: value1,
            [key2]: value2
          }
        };

        const expected = [
          {
            namespace: namespace1,
            name: profile1,
            version: version1,
            key: key1,
            value: value1
          },
          {
            namespace: namespace1,
            name: profile1,
            version: version1,
            key: key2,
            value: value2
          },
          {
            namespace: namespace2,
            name: profile2,
            version: version2,
            key: key1,
            value: value1
          },
          {
            namespace: namespace2,
            name: profile2,
            version: version2,
            key: key2,
            value: value2
          }
        ];

        const actual = ungroupProfileFiltersDto(dto);
        expect(actual).toStrictEqual(expected);
      });
    });

    describe('serializeProfileFiltersDto', () => {
      it('should serialize filters with one namespace and field', () => {
        const filters = [
          buildProfileFilter(namespace1, profile1, version1, key1, value1)
        ];

        const expected =
          'eyJ0ZXN0Lm5hbWVzcGFjZS4xfFRlc3RQcm9maWxlMXwxLjAuMCI6eyJrZXkxIjoidmFsdWUxIn19';

        const dto = mapProfileFiltersToDto(filters);
        const actual = serializeProfileFiltersDto(dto);
        expect(actual).toBe(expected);
      });

      it('should serialize filters with one namespace and multiple fields', () => {
        const filters = [
          buildProfileFilter(namespace1, profile1, version1, key1, value1),
          buildProfileFilter(namespace1, profile1, version1, key2, value2)
        ];

        const expected =
          'eyJ0ZXN0Lm5hbWVzcGFjZS4xfFRlc3RQcm9maWxlMXwxLjAuMCI6eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6InZhbHVlMiJ9fQ==';

        const dto = mapProfileFiltersToDto(filters);
        const actual = serializeProfileFiltersDto(dto);
        expect(actual).toBe(expected);
      });

      it('should serialize filters with multiple namespaces and multiple fields', () => {
        const filters = [
          buildProfileFilter(namespace1, profile1, version1, key1, value1),
          buildProfileFilter(namespace1, profile1, version1, key2, value2),
          buildProfileFilter(namespace2, profile2, version2, key1, value1),
          buildProfileFilter(namespace2, profile2, version2, key2, value2)
        ];

        const expected =
          'eyJ0ZXN0Lm5hbWVzcGFjZS4xfFRlc3RQcm9maWxlMXwxLjAuMCI6eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6InZhbHVlMiJ9LCJ0ZXN0Lm5hbWVzcGFjZS4yfFRlc3RQcm9maWxlMnwyLjAuMCI6eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6InZhbHVlMiJ9fQ==';

        const dto = mapProfileFiltersToDto(filters);
        const actual = serializeProfileFiltersDto(dto);
        expect(actual).toBe(expected);
      });
    });

    describe('deserializeProfileFiltersToDto', () => {
      it('should deserialize filters with one namespace and field', () => {
        const base64 =
          'eyJ0ZXN0Lm5hbWVzcGFjZS4xfFRlc3RQcm9maWxlMXwxLjAuMCI6eyJrZXkxIjoidmFsdWUxIn19';

        const expected = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1
          }
        };

        const actual = deserializeProfileFiltersToDto(base64);
        expect(actual).toStrictEqual(expected);
      });

      it('should deserialize filters with one namespace and multiple fields', () => {
        const base64 =
          'eyJ0ZXN0Lm5hbWVzcGFjZS4xfFRlc3RQcm9maWxlMXwxLjAuMCI6eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6InZhbHVlMiJ9fQ==';

        const expected = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1,
            [key2]: value2
          }
        };

        const actual = deserializeProfileFiltersToDto(base64);
        expect(actual).toStrictEqual(expected);
      });

      it('should deserialize filters with multiple namespaces and multiple fields', () => {
        const base64 =
          'eyJ0ZXN0Lm5hbWVzcGFjZS4xfFRlc3RQcm9maWxlMXwxLjAuMCI6eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6InZhbHVlMiJ9LCJ0ZXN0Lm5hbWVzcGFjZS4yfFRlc3RQcm9maWxlMnwyLjAuMCI6eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6InZhbHVlMiJ9fQ==';

        const expected = {
          [`${namespace1}|${profile1}|${version1}`]: {
            [key1]: value1,
            [key2]: value2
          },
          [`${namespace2}|${profile2}|${version2}`]: {
            [key1]: value1,
            [key2]: value2
          }
        };

        const actual = deserializeProfileFiltersToDto(base64);
        expect(actual).toStrictEqual(expected);
      });
    });
  });
});
