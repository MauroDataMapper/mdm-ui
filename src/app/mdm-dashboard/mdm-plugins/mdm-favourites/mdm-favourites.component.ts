/*
Copyright 2020 University of Oxford

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

import { Component, OnInit } from '@angular/core';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { forkJoin } from 'rxjs';
import { ResourcesService } from '@mdm/services/resources.service';

@Component({
  selector: 'mdm-mdm-favourites',
  templateUrl: './mdm-favourites.component.html',
  styleUrls: ['./mdm-favourites.component.scss']
})
export class MdmFavouritesComponent implements OnInit {
  allFavourites: any;
  favourites = [];

  formData = {
      filterCriteria: '',
  };
  constructor(
      private resources: ResourcesService,
      private elementTypes: ElementTypesService,
      private favouriteHandler: FavouriteHandlerService
  ) { }

  ngOnInit(): void {
      this.loadFavourites();
  }

  loadFavourites = () => {
      const queries = [];
      this.allFavourites = this.favouriteHandler.get();

      const domainTypes = this.elementTypes.getBaseTypes();

      this.allFavourites.forEach((favourite) => {
          const resourceName = domainTypes[favourite.domainType].resourceName;
          // make sure we have a resource name for it
          if (!this.resources[resourceName]) {
              return;
          }
          queries.push(this.resources[resourceName].get(favourite.id));
      });

      forkJoin(queries).subscribe((results) => {
          let index = 0;
          results.forEach((res: any) => {
              const result = res.body;
              this.allFavourites[index] = result;
              index++;
          });
          this.favourites = this.filter(
              Object.assign([], this.allFavourites),
              this.formData.filterCriteria
          );
        //   console.log(this.favourites);
      });
  };

  filter = (allFavourites, text) => {
      let i = allFavourites.length - 1;
      while (i >= 0) {
          if (allFavourites[i].label.trim().toLowerCase().indexOf(text.trim().toLowerCase()) === -1) {
              allFavourites.splice(i, 1);
          }
          i--;
      }
      return allFavourites;
  };
}
