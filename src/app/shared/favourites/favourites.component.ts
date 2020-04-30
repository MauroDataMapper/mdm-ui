import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { ResourcesService } from '@mdm/services/resources.service';
import { forkJoin } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'mdm-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.sass']
})
export class FavouritesComponent implements OnInit {
  @Output() favouriteClick = new EventEmitter<any>();
  @Output() favouriteDbClick = new EventEmitter<any>();

  reloading = false;
  allFavourites: any;
  selectedFavourite: any;
  menuOptions = [];

  favourites = [];
  formData = {
    filterCriteria: ''
  };

  contextMenuPosition = { x: '0px', y: '0px' };

  @ViewChild(MatMenuTrigger, { static: false }) contextMenu: MatMenuTrigger;

  constructor(
    private resources: ResourcesService,
    private elementTypes: ElementTypesService,
    private favouriteHandler: FavouriteHandlerService
  ) {}

  ngOnInit() {
    this.loadFavourites();
  }

  loadFavourites = () => {
    this.reloading = true;
    const queries = [];
    this.allFavourites = this.favouriteHandler.get();

    const domainTypes = this.elementTypes.getBaseTypes();

    this.allFavourites.forEach(favourite => {
      const resourceName = domainTypes[favourite.domainType].resourceName;
      // make sure we have a resource name for it
      if (!this.resources[resourceName]) {
        return;
      }

      queries.push(this.resources[resourceName].get(favourite.id));
    });

    if (queries.length === 0) {
      this.reloading = false;
    }

    forkJoin(queries).subscribe(results => {
      let index = 0;
      results.forEach((res: any) => {
        const result = res.body;
        this.allFavourites[index] = result;
        index++;
      });
      this.reloading = false;
      this.favourites = this.filter(
        Object.assign([], this.allFavourites),
        this.formData.filterCriteria
      );
    });
  };

  filter = (allFavourites, text) => {
    let i = allFavourites.length - 1;
    while (i >= 0) {
      if (
        allFavourites[i].label
          .trim()
          .toLowerCase()
          .indexOf(text.trim().toLowerCase()) === -1
      ) {
        allFavourites.splice(i, 1);
      }
      i--;
    }
    return allFavourites;
  };

  nodeClick = ($event, favourite) => {
    this.click($event, favourite);
  };

  nodeDbClick = ($event, favourite) => {
    this.click($event, favourite);
  };

  click = ($event, favourite) => {
    favourite.selected = !favourite.selected;

    if (this.selectedFavourite) {
      this.selectedFavourite.selected = false;
    }
    this.selectedFavourite = favourite;

    if (this.favouriteDbClick) {
      this.favouriteDbClick.emit(favourite);
    }
  };

  dataModelContextMenu(favourite) {
    const subMenu = [
      {
        name: 'Remove from Favourites',
        action: () => {
          this.favouriteHandler.remove(favourite);
        }
      }
    ];
    return subMenu;
  }

  rightClick = (event, favourite) => {
    if (favourite.domainType === 'DataModel') {
      this.menuOptions = this.dataModelContextMenu(favourite);
    }
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { favourite };
    this.contextMenu.menu.focusFirstItem('mouse');

    this.contextMenu.openMenu();
  };

  onSearchInputKeyDown = $event => {
    this.search();
  };

  search = () => {
    this.favourites = this.filter(
      Object.assign([], this.allFavourites),
      this.formData.filterCriteria
    );
  }
}
