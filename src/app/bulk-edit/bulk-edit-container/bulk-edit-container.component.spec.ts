/*
Copyright 2020-2021 University of Oxford
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
import { Title } from '@angular/platform-browser';
import { CatalogueItemDomainType, DataModelDetail, DataModelDetailResponse } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';
import { StateParams, UIRouterGlobals } from '@uirouter/core';
import { of } from 'rxjs';
import { BulkEditStep } from '../types/bulk-edit-types';
import { BulkEditContainerComponent } from './bulk-edit-container.component';

interface MdmDataModelResourceStub {
  get: jest.Mock;
}

interface MdmProfileResourcesStub {
  saveMany: jest.Mock;
}

interface MdmResourcesStub {
  dataModel: MdmDataModelResourceStub;
  profile: MdmProfileResourcesStub;
}

interface UIRouterGlobalsStub {
  params: StateParams;
}

interface TitleStub {
  setTitle: jest.Mock;
}

interface EditingStub {
  start: jest.Mock;
}

interface MessageHandlerStub {
  showSuccess: jest.Mock;
}

describe('BulkEditBaseComponent', () => {
  let harness: ComponentHarness<BulkEditContainerComponent>;

  const resourcesStub: MdmResourcesStub = {
    dataModel: {
      get: jest.fn()
    },
    profile: {
      saveMany: jest.fn()
    }
  }

  const uiRouterGlobalsStub: UIRouterGlobalsStub = {
    params: new StateParams()
  }

  const titleStub: TitleStub = {
    setTitle: jest.fn()
  }

  const editingStub: EditingStub = {
    start: jest.fn()
  }

  const messageHandlerStub: MessageHandlerStub = {
    showSuccess: jest.fn()
  }

  const id = '123';
  const dataModel: DataModelDetail = {
    id,
    label: 'test',
    domainType: CatalogueItemDomainType.DataModel,
    availableActions: [],
    finalised: false
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(
      BulkEditContainerComponent,
      {
        providers: [
          {
            provide: MdmResourcesService,
            useValue: resourcesStub
          },
          {
            provide: UIRouterGlobals,
            useValue: uiRouterGlobalsStub
          },
          {
            provide: Title,
            useValue: titleStub
          },
          {
            provide: EditingService,
            useValue: editingStub
          },
          {
            provide: MessageHandlerService,
            useValue: messageHandlerStub
          }
        ]
      });

    uiRouterGlobalsStub.params.id = id;
  });

  beforeEach(() => {
    resourcesStub.dataModel.get
      .mockImplementationOnce(() => of<DataModelDetailResponse>({
        body: dataModel
      }));
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should prepare the component', () => {
    harness.component.ngOnInit();

    expect(harness.component.parent).toBe(dataModel);
    expect(harness.component.currentStep).toBe(BulkEditStep.Selection);
    expect(titleStub.setTitle).toHaveBeenCalledWith(`Bulk Edit - ${dataModel.label}`);
    expect(editingStub.start).toHaveBeenCalled();
  });

  it('should move to next step', () => {
    harness.component.next();
    expect(harness.component.currentStep).toBe(BulkEditStep.Editor);
  });

  it('should move to previous step', () => {
    harness.component.currentStep = BulkEditStep.Editor;
    harness.component.previous();
    expect(harness.component.currentStep).toBe(BulkEditStep.Selection);
  });

  it('should save profiles', () => {
    resourcesStub.profile.saveMany.mockImplementationOnce(() => of({}));

    harness.component.ngOnInit();
    harness.component.save([]);

    expect(resourcesStub.profile.saveMany).toHaveBeenCalled();
    expect(messageHandlerStub.showSuccess).toHaveBeenCalled();
  });
});
