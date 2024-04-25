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
import { Title } from '@angular/platform-browser';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { MauroItemProviderService } from '@mdm/mauro/mauro-item-provider.service';
import { MauroIdentifier, MauroItem } from '@mdm/mauro/mauro-item.types';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
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
  stop: jest.Mock;
  confirmCancelAsync: jest.Mock;
}

interface MessageHandlerStub {
  showSuccess: jest.Mock;
}

interface StateHandlerStub {
  GoPrevious: jest.Mock;
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
    start: jest.fn(),
    stop: jest.fn(),
    confirmCancelAsync: jest.fn()
  };

  const messageHandlerStub: MessageHandlerStub = {
    showSuccess: jest.fn()
  };

  const stateHandlerStub: StateHandlerStub = {
    GoPrevious: jest.fn()
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
        },
        {
          provide: StateHandlerService,
          useValue: stateHandlerStub
        }
      ]
    });

    uiRouterGlobalsStub.params.id = id;
  });

  beforeEach(() => {
    itemProviderStub.get.mockImplementationOnce(() => of(dataModel));
    stateHandlerStub.GoPrevious.mockClear();
    editingStub.stop.mockClear();
    editingStub.confirmCancelAsync.mockClear();
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should prepare the component', () => {
    harness.component.ngOnInit();

    expect(harness.component.parent).toBe(dataModel);
    expect(harness.component.currentStep).toBe(BulkEditStep.Selection);
    expect(harness.component.hasChanged).toBe(false);
    expect(titleStub.setTitle).toHaveBeenCalledWith(
      `Bulk Edit - ${dataModel.label}`
    );
    expect(editingStub.start).toHaveBeenCalled();
  });

  it('should mark as changed when changed event emitted', () => {
    expect(harness.component.hasChanged).toBe(false);
    harness.component.onChanged();
    expect(harness.component.hasChanged).toBe(true);
  });

  it('should mark as not changed when saved event emitted', () => {
    harness.component.hasChanged = true;
    expect(harness.component.hasChanged).toBe(true);
    harness.component.onSaved();
    expect(harness.component.hasChanged).toBe(false);
  });

  it('should move to next step', () => {
    harness.component.next();
    expect(harness.component.currentStep).toBe(BulkEditStep.Editor);
    expect(harness.component.hasChanged).toBe(false);
  });

  it('should move to previous step when nothing has changed', () => {
    harness.component.currentStep = BulkEditStep.Editor;
    harness.component.hasChanged = false;
    harness.component.previous();
    expect(harness.component.currentStep).toBe(BulkEditStep.Selection);
    expect(harness.component.hasChanged).toBe(false);
    expect(editingStub.confirmCancelAsync).not.toHaveBeenCalled();
  });

  it('should confirm to move to previous step when data has changed and accept', () => {
    harness.component.currentStep = BulkEditStep.Editor;
    harness.component.hasChanged = true;

    editingStub.confirmCancelAsync.mockImplementationOnce(() => of(true));

    harness.component.previous();

    expect(harness.component.currentStep).toBe(BulkEditStep.Selection);
    expect(harness.component.hasChanged).toBe(false);
    expect(editingStub.confirmCancelAsync).toHaveBeenCalled();
  });

  it('should confirm to move to previous step when data has changed and cancel', () => {
    harness.component.currentStep = BulkEditStep.Editor;
    harness.component.hasChanged = true;

    editingStub.confirmCancelAsync.mockImplementationOnce(() => of(false));

    harness.component.previous();

    expect(harness.component.currentStep).toBe(BulkEditStep.Editor);
    expect(harness.component.hasChanged).toBe(true);
    expect(editingStub.confirmCancelAsync).toHaveBeenCalled();
  });

  it('should cancel from selection step', () => {
    harness.component.currentStep = BulkEditStep.Selection;

    harness.component.cancel();

    expect(editingStub.stop).toHaveBeenCalled();
    expect(stateHandlerStub.GoPrevious).toHaveBeenCalled();
    expect(editingStub.confirmCancelAsync).not.toHaveBeenCalled();
  });

  it('should close from editor step when no changes made', () => {
    harness.component.currentStep = BulkEditStep.Editor;
    harness.component.hasChanged = false;

    harness.component.cancel();

    expect(editingStub.stop).toHaveBeenCalled();
    expect(stateHandlerStub.GoPrevious).toHaveBeenCalled();
    expect(editingStub.confirmCancelAsync).not.toHaveBeenCalled();
  });

  it('should close from editor step when changes made and accept', () => {
    harness.component.currentStep = BulkEditStep.Editor;
    harness.component.hasChanged = true;

    editingStub.confirmCancelAsync.mockImplementationOnce(() => of(true));

    harness.component.cancel();

    expect(editingStub.stop).toHaveBeenCalled();
    expect(stateHandlerStub.GoPrevious).toHaveBeenCalled();
    expect(editingStub.confirmCancelAsync).toHaveBeenCalled();
  });

  it('should close from editor step when changes made and cancel', () => {
    harness.component.currentStep = BulkEditStep.Editor;
    harness.component.hasChanged = true;

    editingStub.confirmCancelAsync.mockImplementationOnce(() => of(false));

    harness.component.cancel();

    expect(editingStub.stop).not.toHaveBeenCalled();
    expect(stateHandlerStub.GoPrevious).not.toHaveBeenCalled();
    expect(editingStub.confirmCancelAsync).toHaveBeenCalled();
  });
});
