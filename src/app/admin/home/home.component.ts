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
    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView as string);
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
      case 2:
        return { index: 2, name: 'Profiles Dashboard' };
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
      case 'Profiles Dashboard':
        return { index: 2, name: 'Profiles Dashboard' };
      default:
        return { index: 0, name: 'Active Sessions' };
    }
  }
}
