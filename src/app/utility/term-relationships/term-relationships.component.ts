import { Component, OnInit, Input } from '@angular/core';
import { ResourcesService } from '@mdm/services/resources.service';
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
    private resources: ResourcesService,
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
