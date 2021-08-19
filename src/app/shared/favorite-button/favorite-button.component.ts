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
import { Component, Input, OnInit } from '@angular/core';
import { CatalogueItem } from '@maurodatamapper/mdm-resources';
import { FavouriteHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss']
})
export class FavoriteButtonComponent implements OnInit {
  @Input() catalogueItem: CatalogueItem;

  isFavorite = false;

  constructor(private favorites: FavouriteHandlerService) { }

  ngOnInit(): void {
    if (!this.catalogueItem) {
      return;
    }

    this.isFavorite = this.favorites.isAdded(this.catalogueItem);
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
