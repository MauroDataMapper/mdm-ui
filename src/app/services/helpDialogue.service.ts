import { Injectable } from '@angular/core';
import { HelpDialogComponent } from '../search/help-dialog/help-dialog.component';
import { environment } from '../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, DialogPosition } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class HelpDialogueHandlerService {
  constructor(public dialog: MatDialog, private sanitizer: DomSanitizer) {}

  dialogueMaps: any = {
    Adding_a_data_class: 'Adding_a_data_class',
    Adding_comments: 'Adding_comments',
    Create_a_new_model: 'Create_a_new_model',
    Creating_a_new_type: 'Creating_a_new_type',
    Edit_model_details: 'Edit_model_details',
    Editing_properties: 'Editing_properties',
    Exporting_models: 'Exporting_models',
    Importing_DataModels_Using_XML: 'Importing_DataModels_Using_XML',
    Importing_DataModels_Using_Excel: 'Importing_DataModels_Using_Excel',
    Importing_DataFlows_Using_Excel: 'Importing_DataFlows_Using_Excel',

    Importing_models: 'Importing_models',
    Preferences: 'Preferences',
    Registering_as_a_new_user: 'Registering_as_a_new_user',
    Responding_to_an_email_invitation: 'Responding_to_an_email_invitation',

    Search_Help: 'Search_Help',
    User_profile: 'User_profile',

    Browsing_models: 'Browsing_models',

    Terminology_details: 'Terminology_details',
    Term_details: 'Term_details'
  };

  importerMaps: any = {
    XmlImporterService: 'Importing_DataModels_Using_XML',
    ExcelDataModelImporterService: 'Importing_DataModels_Using_Excel'
  };

  getImporterHelp(importerName: string) {
    return this.importerMaps[importerName];
  }

  open(name: string, position: DialogPosition): void {
    if (!this.dialogueMaps[name]) {
      return;
    }

    let wikiLink = environment.wiki;
    if (wikiLink && wikiLink[wikiLink.length - 1] === '/') {
      wikiLink = wikiLink.substr(0, name.length - 1);
    }
    wikiLink = wikiLink + '/index.php?title=' + this.dialogueMaps[name];
    const contentWikiLink: any = wikiLink + '&action=render';

    const safeWikiLink: any = this.sanitizer.bypassSecurityTrustResourceUrl(contentWikiLink);

    this.dialog.open(HelpDialogComponent, {
      hasBackdrop: true,
      minHeight: '500px',
      minWidth: '600px',
      data: { wikiLink, contentWikiLink: safeWikiLink },
    });
  }
}
