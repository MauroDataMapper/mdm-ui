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
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { ModelHeaderComponent } from './model-header.component';
import { ModelTreeService } from '@mdm/services/model-tree.service';
import { BroadcastService, StateHandlerService } from '@mdm/services';
import { MatDialog } from '@angular/material/dialog';
import {
  CatalogueItemDomainType,
  catalogueItemToMultiFacetAware
} from '@maurodatamapper/mdm-resources';
import { of } from 'rxjs';

describe('ModelHeaderComponent', () => {
  let harness: ComponentHarness<ModelHeaderComponent>;
  let dialog: { openMergeDiff: jest.Mock };
  let stateHandler: { reload: jest.Mock };
  let broadcast: any;

  beforeEach(async () => {
    dialog = {
      openMergeDiff: jest.fn().mockReturnValue({
        afterClosed: () => of({ success: true })
      })
    };

    stateHandler = {
      reload: jest.fn()
    };

    broadcast = {
      reloadCatalogueTree: jest.fn(),
      onApiProperyUpdated: jest.fn().mockReturnValue(of(null))
    };

    harness = await setupTestModuleForComponent(ModelHeaderComponent, {
      providers: [
        {
          provide: ModelTreeService,
          useValue: jest.fn()
        },
        {
          provide: MatDialog,
          useValue: dialog
        },
        {
          provide: StateHandlerService,
          useValue: stateHandler
        },
        {
          provide: BroadcastService,
          useValue: broadcast
        }
      ]
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should open the merge diff modal when merge is selected', () => {
    harness.component.item = {
      id: 'source-id',
      domainType: CatalogueItemDomainType.DataModel
    } as any;

    harness.component.merge();

    expect(dialog.openMergeDiff).toHaveBeenCalledWith({
      sourceId: 'source-id',
      catalogueDomainType: catalogueItemToMultiFacetAware(
        CatalogueItemDomainType.DataModel
      )
    });
    expect(broadcast.reloadCatalogueTree).toHaveBeenCalled();
    expect(stateHandler.reload).toHaveBeenCalled();
  });
});
