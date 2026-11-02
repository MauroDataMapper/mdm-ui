/*
Copyright 2020-2026 University of Oxford and NHS England

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
import { NewDataTypeInlineComponent } from './new-data-type-inline.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { EMPTY, of } from 'rxjs';
import '@mdm/utility/extensions/mat-legacy-dialog.extensions';
import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';

describe('NewDataTypeInlineComponent', () => {
  let harness: ComponentHarness<NewDataTypeInlineComponent>;
  const terminologyList = jest.fn(() => of({ body: { items: [], count: 0 } }));
  const codeSetList = jest.fn(() => of({ body: { items: [], count: 0 } }));

  interface MdmApiPropertiesStub {
    listPublic: jest.Mock
  }

  interface MdmResourcesServiceStub {
    apiProperties: MdmApiPropertiesStub
  }

  const resourcesStub: MdmResourcesServiceStub = {
    apiProperties: {
      listPublic: jest.fn()
    }
  };

  resourcesStub.apiProperties.listPublic.mockImplementationOnce(() => of([]));

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(NewDataTypeInlineComponent, {
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            terminology: {
              list: terminologyList
            },
            codeSet: {
              list: codeSetList
            },
            referenceDataModel: {
              list: () => EMPTY
            },
            apiProperties: {
              listPublic: () => EMPTY
            }
          }
        }
      ]
    })
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('fetches Terminologies using paginated options without requesting all records', () => {
    harness.component.fetchTerminologies('', true, 0, 20);

    expect(terminologyList).toHaveBeenCalledWith({
      max: 20,
      sort: 'label',
      order: 'asc'
    });
  });

  it('fetches CodeSets using paginated options without requesting all records', () => {
    harness.component.fetchCodeSets('ICD', false, 20, 20);

    expect(codeSetList).toHaveBeenCalledWith({
      max: 20,
      offset: 20,
      sort: 'label',
      order: 'asc',
      label: 'ICD'
    });
  });

  it('requires a CodeSet reference for CodeSet data types', () => {
    harness.component.model.domainType = CatalogueItemDomainType.CodeSetType;
    harness.component.model.modelResourceId = '';

    harness.component.validate();

    expect(harness.component.isValid).toBe(false);
  });
});
