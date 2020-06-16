import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { HistoryComponent } from '@mdm/folder/history.component';
import { NewDataTypeInlineComponent } from '@mdm/utility/new-data-type-inline/new-data-type-inline.component';
import {
  GridStackItemComponent,
  GridStackComponent,
  GridStackOptions,
  GridStackItem,
} from 'grid-stack'
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';

@Component({
  selector: 'mdm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChildren(GridStackItemComponent) items: QueryList<GridStackItemComponent>;
  @ViewChild('gridStackMain', { static: false })
  gridStackMain: GridStackComponent;
  area: GridStackOptions = new GridStackOptions();
  widgets: GridStackItem[] = [];
  factory: ComponentFactory = new ComponentFactory();
  compData: Widget[] = new Array<Widget>();

  constructor(private usersSetting: UserSettingsHandlerService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    

    const data: Array<Widget> = JSON.parse(this.usersSetting.get("dashboard"));

    if (data.length > 0) {
      this.compData = data;
    } else {
      const item1: Widget = {
        x: 0,
        y: 0,
        id: "child1",
        width: 5,
        hight: 5,
      };

      const item2: Widget = {
        x: 0,
        y: 5,
        id: "child2",
        width: 5,
        hight: 5,
      };

      this.compData.push(item1, item2);
    }

    this.compData.forEach(x => {
      this.AddWidget(x);
    })
    this.cd.detectChanges();
  }

  AddWidget(data: Widget) {
    var widget = new GridStackItem();
    widget.customId = data.id;
    widget.el = this.factory.resolve(data.id);
    widget.width = data.width;
    widget.height = 4;
    widget.x = data.x;
    widget.y = data.y;
    this.widgets.push(widget);
  }

  Save() {
    this.cd.detectChanges();
    let things = this.gridStackMain.items;
    this.items.forEach((res) => {
      const data = res.nativeElement.dataset;
      let item = this.compData.find((x) => x.id === res.option.customId);
      item.x = parseInt(data.gsX);
      item.y = parseInt(data.gsY);
      item.width = parseInt(data.gsWidth);
      item.hight = parseInt(data.gsHeight);
    });

    this.usersSetting.update("dashboard", JSON.stringify(this.compData));
    alert("Saved");
  }
}

export interface Widget {
  x: number;
  y: number;
  width: number;
  hight: number;
  id: any;
}

export class ComponentFactory {
  constructor() {}

  resolve(name) {
    switch (name) {
      case 'history': {
        return new ComponentPortal(HistoryComponent);
      }
      case 'child2': {
        return new ComponentPortal(NewDataTypeInlineComponent);
      }
    }
  }
}
