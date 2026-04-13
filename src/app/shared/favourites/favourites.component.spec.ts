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
import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { BroadcastService } from '@mdm/services';
import { MauroItemProviderService } from '@mdm/mauro/mauro-item-provider.service';
import { FavouritesComponent } from './favourites.component';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';

describe('FavouritesComponent', () => {
  let component: FavouritesComponent;
  let itemProvider: { getMany: jest.Mock };
  let favouriteHandler: { get: jest.Mock, remove: jest.Mock };
  let broadcast$: Subject<unknown>;

  beforeEach(async () => {
    itemProvider = {
      getMany: jest.fn()
    };

    favouriteHandler = {
      get: jest.fn(),
      remove: jest.fn()
    };

    broadcast$ = new Subject();

    TestBed.overrideComponent(FavouritesComponent, {
      set: {
        template: ''
      }
    });

    await TestBed.configureTestingModule({
      imports: [FavouritesComponent],
      providers: [
        {
          provide: MauroItemProviderService,
          useValue: itemProvider
        },
        {
          provide: FavouriteHandlerService,
          useValue: favouriteHandler
        },
        {
          provide: BroadcastService,
          useValue: {
            onFavouritesChanged: () => broadcast$.asObservable()
          }
        }
      ]
    }).compileComponents();

    component = TestBed.createComponent(FavouritesComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear tree nodes when there are no favourites', () => {
    favouriteHandler.get.mockReturnValue([]);
    component.treeNodes = [
      {
        id: 'stale-id',
        domainType: CatalogueItemDomainType.DataModel,
        label: 'Stale favourite',
        level: 0,
        expandable: true
      }
    ];

    component.loadFavourites();

    expect(itemProvider.getMany).not.toHaveBeenCalled();
    expect(component.favourites).toEqual([]);
    expect(component.treeNodes).toEqual([]);
    expect(component.reloading).toBe(false);
  });

  it('should reload favourites when favourites changed is broadcast', () => {
    favouriteHandler.get
      .mockReturnValueOnce([
        {
          id: 'dm-1',
          domainType: CatalogueItemDomainType.DataModel
        }
      ])
      .mockReturnValueOnce([]);

    itemProvider.getMany.mockReturnValue(
      of([
        {
          id: 'dm-1',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'Data model 1',
          availableActions: []
        }
      ])
    );

    component.ngOnInit();

    expect(component.treeNodes).toHaveLength(1);
    expect(component.treeNodes[0].label).toBe('Data model 1');

    broadcast$.next({ name: 'remove', element: { id: 'dm-1' } });

    expect(component.favourites).toEqual([]);
    expect(component.treeNodes).toEqual([]);
    expect(component.reloading).toBe(false);
  });
});
