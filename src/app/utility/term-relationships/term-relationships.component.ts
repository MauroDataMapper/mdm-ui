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
import { Component, OnInit, Input } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { MatDialog, DialogPosition } from '@angular/material/dialog';
import { TermResult } from '@mdm/model/termModel';
import { Subscription } from 'rxjs';
import { MessageService } from '@mdm/services/message.service';

@Component({
  selector: 'mdm-term-relationships',
  templateUrl: './term-relationships.component.html',
  styleUrls: ['./term-relationships.component.scss']
})
export class TermRelationshipsComponent implements OnInit {
  @Input() term: TermResult;
  @Input() type: any;
  subscription: Subscription;
  totalItems = 0;

  loading = true;
  relationshipTypes = [];
  relations = {};
  constructor(
    private resources: MdmResourcesService,
    private helpDialogueService: HelpDialogueHandlerService,
    private dialog: MatDialog,
    private messageService: MessageService
  ) {
    // this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
    //   this.term = serverResult;
    // });
  }

  ngOnInit() {
    if (this.term) {
      this.resources.term.get(this.term.terminology.id, this.term.id, 'termRelationships', {
          queryStringParams: {
            type: 'source'
          }
        }).subscribe(data => {
            this.totalItems = data.body.count;
            data.body.items.forEach(item => {
              if (!this.relations[item.relationshipType.displayLabel]) {
                this.relationshipTypes.push(item.relationshipType.displayLabel);
                this.relations[item.relationshipType.displayLabel] = [];
              }
              this.relations[item.relationshipType.displayLabel].push(item);
            });
            this.loading = false;
        }, () => {
          this.loading = false;
        });
    }
  }

  public loadHelp() {
    this.helpDialogueService.open('Editing_properties', {
      my: 'right top',
      at: 'bottom'
    } as DialogPosition);
  }
}
