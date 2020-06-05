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
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { DialogPosition } from '@angular/material/dialog';
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(
    private messageHandler: MessageHandlerService,
    private helpDialogueService: HelpDialogueHandlerService,
    private userSettingsHandler: UserSettingsHandlerService,
    private title: Title
  ) {}

  countPerTable = this.userSettingsHandler.defaultSettings.countPerTable;
  expandMoreDescription = this.userSettingsHandler.defaultSettings.expandMoreDescription;
  includeSupersededModels = this.userSettingsHandler.defaultSettings.includeSupersededModels;
  showSupersededModels = this.userSettingsHandler.defaultSettings.showSupersededModels;

  ngOnInit() {
    this.loadSettings();
    this.title.setTitle('Preferences');
  }
  loadSettings = () => {
    this.countPerTable = this.userSettingsHandler.get('countPerTable') || this.countPerTable;
    this.expandMoreDescription = this.userSettingsHandler.get('expandMoreDescription') || this.expandMoreDescription;
    this.includeSupersededModels = this.userSettingsHandler.get('includeSupersededModels') || this.includeSupersededModels;
  };

  saveSettings = () => {
    this.userSettingsHandler.update('countPerTable', this.countPerTable);
    this.userSettingsHandler.update('expandMoreDescription', this.expandMoreDescription);
    this.userSettingsHandler.update('includeSupersededModels', this.includeSupersededModels);

    this.userSettingsHandler.saveOnServer().subscribe(() => {
        this.messageHandler.showSuccess('User preferences saved successfully.');
      }, error => {
        this.messageHandler.showError('Failed to save user preferences.', error);
      }
    );
  };
  public loadHelp() {
    this.helpDialogueService.open('Preferences', {
      my: 'right top',
      at: 'bottom',
    } as DialogPosition);
  }
}
