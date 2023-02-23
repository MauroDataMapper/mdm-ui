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
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import {
  Favourite,
  FavouriteHandlerService
} from '@mdm/services/handlers/favourite-handler.service';
import { Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { BroadcastService } from '@mdm/services';
import { MauroItemProviderService } from '@mdm/mauro/mauro-item-provider.service';
import { MauroIdentifier, MauroItem } from '@mdm/mauro/mauro-item.types';
import {
  FLAT_TREE_LEVEL_START,
  isDomainExpandable,
  MauroItemTreeFlatNode
} from '../mauro-item-tree/mauro-item-tree.types';

@Component({
  selector: 'mdm-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.sass']
})
export class FavouritesComponent implements OnInit, OnDestroy {
  @Output() selectionChange = new EventEmitter<MauroItemTreeFlatNode>();

  reloading = false;
  treeNodes: MauroItemTreeFlatNode[] = [];
  favourites: Favourite[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private itemProvider: MauroItemProviderService,
    private favouriteHandler: FavouriteHandlerService,
    private broadcast: BroadcastService
  ) {}

  ngOnInit() {
    this.loadFavourites();

    this.broadcast
      .onFavouritesChanged()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.loadFavourites());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadFavourites = () => {
    this.reloading = true;
    this.favourites = [];

    const identifiers: MauroIdentifier[] = this.favouriteHandler
      .get()
      .map((favourite) => {
        return {
          ...favourite,
          fetchOptions: {
            failSilently: true
          }
        };
      });

    this.itemProvider
      .getMany(identifiers)
      .pipe(
        map((items) => this.cleanUnusedFavourites(items)),
        map((items) => items.sort((a, b) => a.label.localeCompare(b.label))),
        finalize(() => (this.reloading = false))
      )
      .subscribe((items) => {
        this.favourites = items;
        this.treeNodes = items.map((item) => {
          return {
            ...item,
            level: FLAT_TREE_LEVEL_START,
            expandable: isDomainExpandable(item.domainType)
          };
        });
      });
  };

  selected(node: MauroItemTreeFlatNode) {
    this.selectionChange.emit(node);
  }

  private cleanUnusedFavourites(items: MauroItem[]) {
    // Identify catalogue items that were favourites but have been removed from the catalogue
    // Then clear them from the user favourites to not be issues anymore
    items
      .filter((item) => item.error)
      .forEach((item) => this.favouriteHandler.remove(item));

    return items.filter((item) => !item.error);
  }
}
