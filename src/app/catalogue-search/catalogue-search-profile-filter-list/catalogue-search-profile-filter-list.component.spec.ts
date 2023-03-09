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
import { FormGroup, Validators } from '@angular/forms';
import {
  ProfileDefinition,
  ProfileDefinitionResponse,
  ProfileSummary,
  ProfileSummaryIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { Observable, of } from 'rxjs';

import { CatalogueSearchProfileFilterListComponent } from './catalogue-search-profile-filter-list.component';

describe('CatalogueSearchProfileFiltersComponent', () => {
  let harness: ComponentHarness<CatalogueSearchProfileFilterListComponent>;

  const resourcesStub = {
    profile: {
      definition: jest.fn() as jest.MockedFunction<
        (
          namespace: string,
          name: string
        ) => Observable<ProfileDefinitionResponse>
      >,
      providers: jest.fn() as jest.MockedFunction<
        () => Observable<ProfileSummaryIndexResponse>
      >
    }
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(
      CatalogueSearchProfileFilterListComponent,
      {
        providers: [
          {
            provide: MdmResourcesService,
            useValue: resourcesStub
          }
        ]
      }
    );
  });

  const providers: ProfileSummary[] = [...Array(2).keys()].map((i) => ({
    name: `profile${i}`,
    namespace: 'uk.ac.mauro.test',
    metadataNamespace: 'uk.ac.mauro.test.profile',
    version: '1',
    displayName: `Profile ${i}`,
    domains: [],
    knownMetadataKeys: [],
    providerType: 'test',
    allowsExtraMetadataKeys: false
  }));

  beforeEach(() => {
    resourcesStub.profile.providers.mockImplementation(() =>
      of({
        body: providers
      })
    );
  });

  afterEach(() => harness.component.ngOnDestroy());

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.providers).toStrictEqual([]);
    expect(harness.component.filters.length).toBe(0);
  });

  it('should fetch all providers on initialisation', () => {
    harness.component.ngOnInit();
    expect(harness.component.providers).toStrictEqual(providers);
  });

  describe('table modifications', () => {
    it.each([0, 1, 2])(
      'should create a new row when initial row count is %p',
      (initial) => {
        harness.component.ngOnInit();

        Array.from(Array(initial).keys()).forEach(() =>
          harness.component.addFilter()
        );
        expect(harness.component.filters.length).toBe(initial);

        const valueChangeSpy = jest.spyOn(
          harness.component.valueChange,
          'emit'
        );

        harness.component.addFilter();
        expect(harness.component.filters.length).toBe(initial + 1);
        expect(valueChangeSpy).toHaveBeenCalled();
      }
    );

    it.each([
      [1, 2],
      [0, 1],
      [3, 5]
    ])(
      'should remove row %p when initial row count is %p',
      (index, initial) => {
        harness.component.ngOnInit();

        Array.from(Array(initial).keys()).forEach(() =>
          harness.component.addFilter()
        );
        expect(harness.component.filters.length).toBe(initial);

        const valueChangeSpy = jest.spyOn(
          harness.component.valueChange,
          'emit'
        );

        harness.component.removeFilter(index);
        expect(harness.component.filters.length).toBe(initial - 1);
        expect(valueChangeSpy).toHaveBeenCalled();
      }
    );

    it('should reset all rows back to zero', () => {
      harness.component.ngOnInit();

      harness.component.addFilter();
      harness.component.addFilter();
      expect(harness.component.filters.length).toBe(2);

      const valueChangeSpy = jest.spyOn(harness.component.valueChange, 'emit');

      harness.component.reset();
      expect(harness.component.filters.length).toBe(0);
      expect(valueChangeSpy).toHaveBeenCalled();
    });
  });

  describe('filter rows', () => {
    let formGroup: FormGroup<any>;

    beforeEach(() => {
      // Initialise and add at least one row
      harness.component.ngOnInit();
      harness.component.addFilter();

      formGroup = harness.component.filters.at(0) as FormGroup<any>;
    });

    it('should have form fields setup correctly', () => {
      /* eslint-disable @typescript-eslint/unbound-method */
      expect(formGroup.controls.provider).toBeDefined();
      expect(formGroup.controls.provider.value).toBe(null);
      expect(
        formGroup.controls.provider.hasValidator(Validators.required)
      ).toBe(true);

      expect(formGroup.controls.key).toBeDefined();
      expect(formGroup.controls.key.value).toBe(null);
      expect(formGroup.controls.key.hasValidator(Validators.required)).toBe(
        true
      );

      expect(formGroup.controls.value).toBeDefined();
      expect(formGroup.controls.value.value).toBe('');
      expect(formGroup.controls.value.hasValidator(Validators.required)).toBe(
        true
      );

      expect(formGroup.controls.definition).toBeDefined();
      expect(formGroup.controls.key.value).toBe(null);
      /* eslint-enable @typescript-eslint/unbound-method */
    });

    it('should fetch a profile definition when a provider is selected', () => {
      const provider = providers[0];

      const definition: ProfileDefinition = {
        sections: [
          {
            name: 'section',
            fields: [
              {
                fieldName: 'field',
                dataType: 'string',
                metadataPropertyName: 'field'
              }
            ]
          }
        ]
      };

      resourcesStub.profile.definition.mockImplementationOnce(() =>
        of({
          body: definition
        })
      );

      formGroup.controls.provider.setValue(provider);

      expect(formGroup.controls.definition.value).toStrictEqual(definition);
      expect(resourcesStub.profile.definition).toHaveBeenCalledWith(
        provider.namespace,
        provider.name
      );
    });

    it('should reset dependent fields when provider changes', () => {
      formGroup.controls.provider.setValue('initial provider');
      formGroup.controls.key.setValue('key test');
      formGroup.controls.value.setValue('value test');

      expect(formGroup.controls.key.value).not.toBeNull();
      expect(formGroup.controls.value.value).not.toBe('');

      formGroup.controls.provider.setValue('new provider');

      expect(formGroup.controls.key.value).toBeNull();
      expect(formGroup.controls.value.value).toBeNull();
    });

    it('should reset dependent fields when key changes', () => {
      formGroup.controls.key.setValue('initial key');
      formGroup.controls.value.setValue('value test');

      expect(formGroup.controls.value.value).not.toBe('');

      formGroup.controls.key.setValue('new key');

      expect(formGroup.controls.value.value).toBeNull();
    });
  });
});
