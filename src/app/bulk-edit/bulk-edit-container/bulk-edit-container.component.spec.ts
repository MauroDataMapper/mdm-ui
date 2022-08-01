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
import { Title } from '@angular/platform-browser';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { MauroItemProviderService } from '@mdm/mauro/mauro-item-provider.service';
import { MauroIdentifier, MauroItem } from '@mdm/mauro/mauro-item.types';
import { MessageHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { StateParams, UIRouterGlobals } from '@uirouter/core';
import { Observable, of } from 'rxjs';
import { BulkEditStep } from '../bulk-edit.types';
import { BulkEditContainerComponent } from './bulk-edit-container.component';

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

  const itemProviderStub = {
    get: jest.fn() as jest.MockedFunction<
      (identifier: MauroIdentifier) => Observable<MauroItem>
    >
  };

  const uiRouterGlobalsStub: UIRouterGlobalsStub = {
    params: new StateParams()
  };

  const titleStub: TitleStub = {
    setTitle: jest.fn()
  };

  const editingStub: EditingStub = {
    start: jest.fn()
  };

  const messageHandlerStub: MessageHandlerStub = {
    showSuccess: jest.fn()
  };

  const id = '123';
  const dataModel: MauroItem = {
    id,
    label: 'test',
    domainType: CatalogueItemDomainType.DataModel,
    availableActions: [],
    finalised: false
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BulkEditContainerComponent, {
      providers: [
        {
          provide: MauroItemProviderService,
          useValue: itemProviderStub
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
    itemProviderStub.get.mockImplementationOnce(() => of(dataModel));
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should prepare the component', () => {
    harness.component.ngOnInit();

    expect(harness.component.parent).toBe(dataModel);
    expect(harness.component.currentStep).toBe(BulkEditStep.Selection);
    expect(titleStub.setTitle).toHaveBeenCalledWith(
      `Bulk Edit - ${dataModel.label}`
    );
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
});
