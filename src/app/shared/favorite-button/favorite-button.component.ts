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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CatalogueItem } from '@maurodatamapper/mdm-resources';
import { BroadcastService, FavouriteHandlerService, SecurityHandlerService } from '@mdm/services';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mdm-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss']
})
export class FavoriteButtonComponent implements OnInit, OnDestroy {
  @Input() catalogueItem: CatalogueItem;

  isLoggedIn = false;
  isFavorite = false;

  private $unsubscribe = new Subject();

  constructor(
    private securityHandler: SecurityHandlerService,
    private favorites: FavouriteHandlerService,
    private broadcast: BroadcastService) { }

  ngOnInit(): void {
    if (!this.catalogueItem) {
      return;
    }

    this.isLoggedIn = this.securityHandler.isLoggedIn();
    if (!this.isLoggedIn) {
      return;
    }

    this.isFavorite = this.favorites.isAdded(this.catalogueItem);

    this.broadcast
      .onFavouritesChanged()
      .pipe(
        takeUntil(this.$unsubscribe),
        filter(data => data.element.id === this.catalogueItem.id)
      )
      .subscribe(data => {
        this.isFavorite = data.name === 'add';
      });
  }

  ngOnDestroy(): void {
    this.$unsubscribe.next();
    this.$unsubscribe.complete();
  }

  toggle() {
    if (!this.catalogueItem) {
      return;
    }

    if (this.favorites.toggle(this.catalogueItem)) {
      this.isFavorite = this.favorites.isAdded(this.catalogueItem);
    }
  }

}
