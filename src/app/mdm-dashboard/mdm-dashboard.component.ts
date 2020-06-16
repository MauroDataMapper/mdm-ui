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
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';
import {
  GridstackItemComponent,
  GridstackComponent,
  GridstackOptions,
  Item,
} from '@libria/gridstack';
import { AboutComponent } from '@mdm/about/about.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-dashboard',
  templateUrl: './mdm-dashboard.component.html',
  styleUrls: ['./mdm-dashboard.component.scss'],
})
export class MdmDashboardComponent implements OnInit {
  @ViewChildren(GridstackItemComponent) items: QueryList<
    GridstackItemComponent
  >;
  @ViewChild('gridStackMain', { static: false })
  gridStackMain: GridstackComponent;
  area: GridstackOptions;
  widgets: Item[] = [];
  factory: ComponentFactory = new ComponentFactory();
  compData: Widget[] = new Array<Widget>();

  constructor(
    private usersSetting: UserSettingsHandlerService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit(): void {  
    this.title.setTitle('Dashboard');  
    const layout = this.usersSetting.get('dashboard');
    if (layout) {
      const data: Array<Widget> = JSON.parse(layout);
      this.compData = data;
    } else {
      const item1: Widget = {
        x: 0,
        y: 0,
        id: 'history',
        width: 5,
        height: 5,
      };

      const item2: Widget = {
        x: 5,
        y: 0,
        id: 'new',
        width: 5,
        height: 5,
      };

      this.compData.push(item1, item2);
    }

    this.compData.forEach((x) => {
      this.AddWidget(x);
    });
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.title.setTitle('Dashboard');  
  }

  AddWidget(data: Widget) {
    let widget: Item = {
      id: data.id,
      el: this.factory.resolve(data.id),
      width: <number>data.width,
      height: <number>data.height,
      x: <number>data.x,
      y: <number>data.y,
      autoPosition: false,
      lastTriedHeight: null,
      lastTriedWidth: null,
      lastTriedX: null,
      lastTriedY: null,
      locked: false,
      maxHeight: null,
      maxWidth: null,
      minHeight: null,
      minWidth: null,
      noMove: false,
      noResize: false,
    };

    this.widgets.push(widget);
  }

  Save() {
    this.cd.detectChanges();
    let things = this.gridStackMain.gridstackItems;
    this.items.forEach((res) => {
      const data = res.elem.nativeElement.dataset;
      let item = this.compData.find((x) => x.id === res.id);
      item.x = parseInt(data.gsX);
      item.y = parseInt(data.gsY);
      item.width = parseInt(data.gsWidth);
      item.height = parseInt(data.gsHeight);
    });

    this.usersSetting.update('dashboard', JSON.stringify(this.compData));
  }
}

export interface Widget {
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  id: any;
}

export class ComponentFactory {
  constructor() {}

  resolve(name) {
    switch (name) {
      case 'history': {
        return new ComponentPortal(AboutComponent);
      }
      case 'new': {
        return new ComponentPortal(NewDataTypeInlineComponent);
      }
    }
  }
}
