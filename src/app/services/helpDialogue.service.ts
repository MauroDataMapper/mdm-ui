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
import { SharedService } from './shared.service';
import { MessageHandlerService } from './utility/message-handler.service';

@Injectable({
  providedIn: 'root'
})
export class HelpDialogueHandlerService {
  private documentation = this.shared.documentation;

  constructor(
    private shared: SharedService,
    private messageHandler: MessageHandlerService) { }

  getImporterHelpTopic(importerName: string): string {
    return this.documentation.importers[importerName];
  }

  open(name: string): void {
    if (!this.documentation.url) {
      return;
    }

    if (!this.documentation.pages) {
      return;
    }

    if (!this.documentation.pages[name]) {
      this.messageHandler.showWarning('Unfortunately we cannot find the relevent documentation for this feature. Please notify your administrator.');
      return;
    }

    const url = `${this.documentation.url}${this.documentation.pages[name]}`;
    window.open(url, '_blank');
  }
}
