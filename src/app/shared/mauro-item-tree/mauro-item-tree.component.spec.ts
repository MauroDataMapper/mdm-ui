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
import { EMPTY } from 'rxjs';
import { SimpleChange } from '@angular/core';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { FolderService } from '@mdm/folders-tree/folder.service';
import {
  BroadcastService,
  FavouriteHandlerService
} from '@mdm/services';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { ModelTreeService } from '@mdm/services/model-tree.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { ModelsTreeTabStateService } from '../models/models-tree-tab-state.service';
import { MauroItemTreeComponent } from './mauro-item-tree.component';

describe('MauroItemTreeComponent', () => {
  let harness: ComponentHarness<MauroItemTreeComponent>;
  let broadcast: { favouritesChanged: jest.Mock, onApiProperyUpdated: jest.Mock };
  let modelTree: { createNewFolder: jest.Mock };

  beforeEach(async () => {
    broadcast = {
      favouritesChanged: jest.fn(),
      onApiProperyUpdated: jest.fn().mockReturnValue(EMPTY)
    };

    modelTree = {
      createNewFolder: jest.fn().mockReturnValue(EMPTY)
    };

    harness = await setupTestModuleForComponent(MauroItemTreeComponent, {
      providers: [
        {
          provide: ModelTreeService,
          useValue: modelTree
        },
        {
          provide: BroadcastService,
          useValue: broadcast
        },
        {
          provide: FavouriteHandlerService,
          useValue: {
            toggle: jest.fn(),
            isAdded: jest.fn()
          }
        },
        {
          provide: StateHandlerService,
          useValue: {
            Go: jest.fn(),
            NewWindow: jest.fn()
          }
        },
        {
          provide: MessageHandlerService,
          useValue: {
            showError: jest.fn(),
            showSuccess: jest.fn()
          }
        },
        {
          provide: FolderService,
          useValue: {
            loadVersions: jest.fn().mockResolvedValue([])
          }
        },
        {
          provide: ModelsTreeTabStateService,
          useValue: {
            setNextActiveTab: jest.fn(),
            consumeNextActiveTab: jest.fn()
          }
        }
      ]
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should refresh favourites when add-folder dialog flow closes from favourites', () => {
    const node = {
      id: 'folder-1',
      domainType: CatalogueItemDomainType.Folder,
      label: 'Folder 1',
      level: 0,
      expandable: true,
      availableActions: [],
      access: {
        canCreateVersionedFolder: false
      }
    } as any;

    harness.component.wizardReturnTab = 'favourites';
    harness.component.handleAddFolder(node);

    expect(modelTree.createNewFolder).toHaveBeenCalled();
    expect(broadcast.favouritesChanged).toHaveBeenCalledWith({
      name: 'add',
      element: node
    });
  });

  it('should preserve expanded nodes when reloading data', () => {
    const initialNodes = [
      {
        id: 'folder-1',
        domainType: CatalogueItemDomainType.Folder,
        label: 'Folder 1',
        level: 0,
        expandable: true,
        availableActions: []
      }
    ] as any;

    harness.component.wizardReturnTab = 'favourites';
    harness.component.ngOnChanges({
      nodes: new SimpleChange([], initialNodes, true)
    });

    const initialNode = harness.component.treeControl.dataNodes[0];
    harness.component.treeControl.expand(initialNode);
    expect(harness.component.treeControl.isExpanded(initialNode)).toBe(true);

    const refreshedNodes = [
      {
        ...initialNodes[0]
      }
    ] as any;

    harness.component.ngOnChanges({
      nodes: new SimpleChange(initialNodes, refreshedNodes, false)
    });

    const refreshedNode = harness.component.treeControl.dataNodes[0];
    expect(harness.component.treeControl.isExpanded(refreshedNode)).toBe(true);
  });
});
