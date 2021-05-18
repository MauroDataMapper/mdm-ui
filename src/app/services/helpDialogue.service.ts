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
import { Injectable } from '@angular/core';
import { HelpDialogComponent } from '../search/help-dialog/help-dialog.component';
import { environment } from '@env/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class HelpDialogueHandlerService {
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

  constructor(public dialog: MatDialog, private sanitizer: DomSanitizer) {}

  getImporterHelp(importerName: string) {
    return this.importerMaps[importerName];
  }

  open(name: string): void {
    // TODO: replace with href link
    // if (!this.dialogueMaps[name]) {
    //   return;
    // }

    // let wikiLink = environment.wiki;
    // if (wikiLink && wikiLink[wikiLink.length - 1] === '/') {
    //   wikiLink = wikiLink.substr(0, name.length - 1);
    // }
    // wikiLink = `${wikiLink}/index.php?title=${this.dialogueMaps[name]}`;
    // const contentWikiLink: any = wikiLink + '&action=render';

    // const safeWikiLink: any = this.sanitizer.bypassSecurityTrustResourceUrl(contentWikiLink);

    // this.dialog.open(HelpDialogComponent, {
    //   minHeight: '500px',
    //   minWidth: '600px',
    //   data: { wikiLink, contentWikiLink: safeWikiLink },
    // });
  }
}
