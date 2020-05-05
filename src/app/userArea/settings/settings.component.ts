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
