import { Component, OnInit } from '@angular/core';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class DashboardComponent implements OnInit {
  activeTab: any;
  appVersion: string;

  constructor(
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private shared: SharedService,
    private title: Title
  ) {}

  ngOnInit() {
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView);
    this.appVersion = this.shared.appVersion;
    this.title.setTitle('Dashboard');
  }

  tabSelected(itemsName) {
    const tab = this.getTabDetail(itemsName);
    this.stateHandler.Go(
      'admin/home',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
  }

  getTabDetail(tabIndex) {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'Active Sessions' };
      case 1:
        return { index: 1, name: 'Plugins & Modules' };
      default:
        return { index: 0, name: 'Active Sessions' };
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'Active Sessions':
        return { index: 0, name: 'Active Sessions' };
      case 'Plugins & Modules':
        return { index: 1, name: 'Plugins & Modules' };
      default:
        return { index: 0, name: 'Active Sessions' };
    }
  }
}
