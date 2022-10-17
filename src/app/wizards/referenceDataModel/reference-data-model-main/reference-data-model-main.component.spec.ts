/*
Copyright 2020-2022 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import {
  CatalogueItemDomainType,
  FolderDetailResponse,
  MdmResponse,
  ModelCreatePayload,
  Uuid,
  VersionedFolderDetailResponse
} from '@maurodatamapper/mdm-resources';
import { FolderService } from '@mdm/folders-tree/folder.service';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { MockComponent } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { ReferenceDataModelMainComponent } from './reference-data-model-main.component';

describe('ReferenceDataModelMainComponent', () => {
  let harness: ComponentHarness<ReferenceDataModelMainComponent>;

  const foldersStub = {
    getFolder: jest.fn() as jest.MockedFunction<
      (
        id: Uuid,
        domainType: CatalogueItemDomainType
      ) => Observable<FolderDetailResponse | VersionedFolderDetailResponse>
    >
  };

  const resourcesStub = {
    referenceDataModel: {
      create: jest.fn() as jest.MockedFunction<
        (
          folderId: Uuid,
          data: ModelCreatePayload
        ) => Observable<MdmResponse<MauroItem>>
      >
    }
  };

  const messageHandlerStub = {
    showSuccess: jest.fn()
  };

  const stateHandlerStub = {
    Go: jest.fn()
  };

  beforeEach(async () => {
    // Default endpoint call
    foldersStub.getFolder.mockImplementationOnce(() =>
      of({
        body: {
          id: '123',
          domainType: CatalogueItemDomainType.Folder,
          label: 'Folder',
          availableActions: []
        }
      })
    );

    harness = await setupTestModuleForComponent(
      ReferenceDataModelMainComponent,
      {
        declarations: [MockComponent(ElementClassificationsComponent)],
        providers: [
          {
            provide: FolderService,
            useValue: foldersStub
          },
          {
            provide: MdmResourcesService,
            useValue: resourcesStub
          },
          {
            provide: MessageHandlerService,
            useValue: messageHandlerStub
          },
          {
            provide: StateHandlerService,
            useValue: stateHandlerStub
          }
        ]
      }
    );
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should setup the form on initialisation', () => {
    harness.component.ngOnInit();
    expect(harness.component.setupForm).toBeDefined();
    expect(harness.component.label.value).toBe('');
    expect(harness.component.author.value).toBe('');
    expect(harness.component.organisation.value).toBe('');
    expect(harness.component.description.value).toBe('');
    expect(harness.component.classifiers.value).toStrictEqual([]);
  });

  it('should not create a Reference Data Model when the form is invalid', () => {
    harness.component.ngOnInit();
    harness.component.save();
    expect(resourcesStub.referenceDataModel.create.mock.calls.length).toBe(0);
  });

  it('should create a Reference Data Model when the form is valid', () => {
    // Return "created" reference data model
    resourcesStub.referenceDataModel.create.mockImplementationOnce(() =>
      of({
        body: {
          id: '1234',
          domainType: CatalogueItemDomainType.ReferenceDataModel,
          label: 'Reference Data Model'
        }
      })
    );

    harness.component.ngOnInit();
    harness.component.label.setValue('Reference Data Model');
    harness.component.author.setValue('Tester');
    harness.component.organisation.setValue('Mauro');

    harness.component.save();

    expect(resourcesStub.referenceDataModel.create.mock.calls.length).toBe(1);
    expect(messageHandlerStub.showSuccess.mock.calls.length).toBe(1);
    expect(stateHandlerStub.Go.mock.calls.length).toBe(1);
  });
});
