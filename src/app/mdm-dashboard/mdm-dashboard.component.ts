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

import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';
import { Title } from '@angular/platform-browser';
import { MdmFavouritesComponent } from '@mdm/mdm-dashboard/mdm-plugins/mdm-favourites/mdm-favourites.component';
import { AboutComponent } from '@mdm/about/about.component';
import {
  GridsterConfig,
  GridsterItem,
  GridsterComponent,
  GridType,
  CompactType,
} from 'angular-gridster2';
import { InputModalComponent } from '@mdm/modals/input-modal/input-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { SelectModalComponent, SelectModalItem } from '@mdm/modals/select-modal/select-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'mdm-dashboard',
  templateUrl: './mdm-dashboard.component.html',
  styleUrls: ['./mdm-dashboard.component.scss'],
})
export class MdmDashboardComponent implements OnInit {
  inEditMode = false;
  @ViewChild(GridsterComponent) gridster: GridsterComponent;
  options: GridsterConfig;

  availableWidgets : Array<SelectModalItem> = [ {display: "About",  value:"about"},{ value:   "mdmFavourites", display :"Favorites"}];
  factory: ComponentFactory = new ComponentFactory();
  widgets: GridsterItem[] = new Array<GridsterItem>();

  dashboardSetting = "dashboard";

  constructor(
    private usersSetting: UserSettingsHandlerService,
    private cd: ChangeDetectorRef,
    private title: Title,
    public dialog: MatDialog,
    private toast: ToastrService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Dashboard');
    this.options = {
      gridType: GridType.Fit,
      compactType: CompactType.None,
      pushItems: true,
      draggable: {
        enabled: false,
      },
      resizable: {
        enabled: false,
      },
    };
    this.LayoutGrid();
  }

  private LayoutGrid() {
    const layout = this.usersSetting.get(this.dashboardSetting);
    if (layout) {
      const data: Array<GridsterItem> = JSON.parse(layout);
      data.forEach(x => x.el = this.factory.resolve(x.id));
      this.widgets = data;
    }
    else {
      const item1: GridsterItem = {
        x: 1,
        y: 0,
        id: 'mdmFavourites',
        rows: 2,
        cols: 1,
        el: this.factory.resolve("mdmFavourites")
      };

      const item2: GridsterItem = {
        x: 0,
        y: 0,
        id: 'about',
        rows: 1,
        cols: 1,
        el: this.factory.resolve("about")
      };


      this.widgets.push(item1, item2);
    }



    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    this.title.setTitle('Dashboard');
  }

  Save() {
    this.cd.detectChanges();
      let saveArray : Array<GridsterItem> = Object.assign([],this.widgets);
      this.gridster.grid.forEach((item) => {
      let wid = saveArray.find((x) => x.id === item.item.id);
      wid = item.item;
      wid.el = null;
    });
    this.usersSetting.update(this.dashboardSetting, JSON.stringify(saveArray));
    this.options.resizable.enabled = false;
    this.options.draggable.enabled = false;
    this.options.api.optionsChanged();
    this.LayoutGrid();
    this.inEditMode = !this.inEditMode;
    this.toast.info("Layout has been saved","Layout");
  }

  Reset() {
      this.usersSetting.update(this.dashboardSetting, null);
      this.widgets = [];
      this.LayoutGrid();
      this.toast.info("Layout has been reset","Layout");
  }

  Edit(): void {
    this.options.resizable.enabled = true;
    this.options.draggable.enabled = true;
    this.options.api.optionsChanged();
    this.inEditMode = !this.inEditMode;
  }

  AddWidget(): void {
      const dialog = this.dialog.open(SelectModalComponent, {
        data: {
          items: this.availableWidgets,
          modalTitle: 'Add a New Widget',
          okBtn: 'Add Widget',
          btnType: 'primary',
          inputLabel: 'Widget name',
          message: 'Please select a widget to add to dashboard'
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result) {
          const newItem: GridsterItem = {
            x: 0,
            y: 0,
            id: result,
            rows: 1,
            cols: 1,
            el: this.factory.resolve(result)
          };
          this.widgets.push(newItem)
        }
      });


  }

  RemoveItem($event, item): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.widgets.splice(this.widgets.indexOf(item), 1);
  }
}


export class ComponentFactory {
  constructor() {}

  resolve(name) {
    switch (name) {
      case 'mdmFavourites': {
        return new ComponentPortal(MdmFavouritesComponent);
      }
      case 'about': {
        return new ComponentPortal(AboutComponent);
      }
    }
  }
}
