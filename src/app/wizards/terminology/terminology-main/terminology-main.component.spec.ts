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
import { FolderService } from '@mdm/folders-tree/folder.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';
import { of } from 'rxjs';
import { TerminologyMainComponent } from './terminology-main.component';

interface FolderServiceStub {
  getFolder: jest.Mock;
}

interface MdmTerminologyResourceStub {
  addToFolder: jest.Mock;
}

interface MdmResourcesStub {
  terminology: MdmTerminologyResourceStub;
}

interface MessageHandlerServiceStub {
  showSuccess: jest.Mock;
}

interface StateHandlerServiceStub {
  Go: jest.Mock;
}

describe('TerminologyMainComponent', () => {
  let harness: ComponentHarness<TerminologyMainComponent>;

  const foldersStub: FolderServiceStub = {
    getFolder: jest.fn()
  };

  const resourcesStub: MdmResourcesStub = {
    terminology: {
      addToFolder: jest.fn()
    }
  };

  const messageHandlerStub: MessageHandlerServiceStub = {
    showSuccess: jest.fn()
  };

  const stateHandlerStub: StateHandlerServiceStub = {
    Go: jest.fn()
  };

  beforeEach(async () => {
    // Default endpoint call
    foldersStub.getFolder.mockImplementationOnce(() => of({}));

    harness = await setupTestModuleForComponent(TerminologyMainComponent, {
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
    });
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

  it('should not create a Terminology when the form is invalid', () => {
    harness.component.ngOnInit();
    harness.component.save();
    expect(resourcesStub.terminology.addToFolder.mock.calls.length).toBe(0);
  });

  it('should create a Terminology when the form is valid', () => {
    // Return "created" terminology
    resourcesStub.terminology.addToFolder.mockImplementationOnce(() => of({
      body: {
        id: '1234'
      }
    }));

    harness.component.ngOnInit();
    harness.component.setupForm.get('label').setValue('Terminology');
    harness.component.setupForm.get('author').setValue('Tester');
    harness.component.setupForm.get('organisation').setValue('Mauro');

    harness.component.save();

    expect(resourcesStub.terminology.addToFolder.mock.calls.length).toBe(1);
    expect(messageHandlerStub.showSuccess.mock.calls.length).toBe(1);
    expect(stateHandlerStub.Go.mock.calls.length).toBe(1);
  });
});
