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
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { TermResult, EditableTerm } from '@mdm/model/termModel';
import { Subscription } from 'rxjs';
import { MessageService } from '@mdm/services/message.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { FavouriteHandlerService } from '@mdm/services/handlers/favourite-handler.service';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { EditingService } from '@mdm/services/editing.service';

@Component({
  selector: 'mdm-term-details',
  templateUrl: './term-details.component.html',
  styleUrls: ['./term-details.component.scss']
})
export class TermDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('aLink', { static: false }) aLink: ElementRef;
  @Input() afterSave: any;
  @Input() editMode = false;
  @Input() mcTerminology: any;
  @Input() hideEditButton: any;
  @Input() openEditForm: any;
  @ViewChildren('editableText') editForm: QueryList<any>;
  download: any;
  downloadLink: any;
  urlText: any;

  mcTerm: TermResult;
  securitySection = false;
  processing = false;
  exportError = null;
  exportList = [];
  exportedFileIsReady = false;
  addedToFavourite = false;
  hasResult = false;
  subscription: Subscription;
  showSecuritySection: boolean;
  showUserGroupAccess: boolean;
  showEdit: boolean;
  showFinalise: boolean;
  showPermission: boolean;
  showDelete: boolean;
  isAdminUser: boolean;
  isLoggedIn: boolean;
  deleteInProgress: boolean;
  editableForm: EditableTerm;
  errorMessage = '';
  showEditMode = false;

  showNewVersion = false;
  compareToList = [];

  constructor(
    private messageService: MessageService,
    private securityHandler: SecurityHandlerService,
    private sharedService: SharedService,
    private helpDialogueService: HelpDialogueHandlerService,
    private favouriteHandler: FavouriteHandlerService,
    private title: Title,
    private messageHandler: MessageHandlerService,
    private resourcesService: MdmResourcesService,
    private broadcastSvc: BroadcastService,
    private editingService: EditingService) {
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.TermDetails();
  }

  ngOnInit() {
    this.editableForm = new EditableTerm();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;

    this.editableForm.show = () => {
      this.editForm.forEach(x =>
        x.edit({
          editing: true,
          focus: x._name === 'moduleName' ? true : false
        })
      );
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editingService.stop();
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.editableForm.description = this.mcTerm.description;
      this.editableForm.url = this.mcTerm.url;
      if (this.mcTerm.classifiers) {
        this.mcTerm.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.mcTerm.aliases) {
        this.mcTerm.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }
    };
  }

  TermDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
      this.mcTerm = serverResult;

      this.editableForm.url = this.mcTerm.url;
      this.editableForm.description = this.mcTerm.description;
      if (this.mcTerm.classifiers) {
        this.mcTerm.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.mcTerm.aliases) {
        this.mcTerm.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }
      if (this.mcTerm.semanticLinks) {
        this.mcTerm.semanticLinks.forEach(link => {
          if (link.linkType === 'New Version Of') {
            this.compareToList.push(link.target);
          }
        });
      }

      if (this.mcTerm.semanticLinks) {
        this.mcTerm.semanticLinks.forEach(link => {
          if (link.linkType === 'Superseded By') {
            this.compareToList.push(link.target);
          }
        });
      }

      if (this.mcTerm != null) {
        this.hasResult = true;
        this.watchDataModelObject();
      }
      this.title.setTitle(`Term - ${this.mcTerm?.label}`);
    }
    );
  }

  watchDataModelObject() {
    const access: any = this.securityHandler.elementAccess(this.mcTerm);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
      this.showPermission = access.showPermission;
      this.showDelete = access.showDelete;
      this.showFinalise = access.showFinalise;
      this.showNewVersion = access.showNewVersion;
    }
    this.addedToFavourite = this.favouriteHandler.isAdded(this.mcTerm);
  }

  ngAfterViewInit(): void {
    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    this.editForm.changes.subscribe(() => {
      this.invokeInlineEditor();

      if (this.editMode) {
        this.editForm.forEach(x =>
          x.edit({
            editing: true,
            focus: x._name === 'moduleName' ? true : false
          })
        );
        this.showForm();
      }
    });
  }

  formBeforeSave = () => {
    this.editMode = false;
    this.errorMessage = '';

    const classifiers = [];
    this.editableForm.classifiers.forEach(cls => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });
    const resource = {
      id: this.mcTerm.id,
      code: this.mcTerm.code,
      definition: this.mcTerm.definition,
      description: this.editableForm.description,
      terminology: this.mcTerm.terminology,
      aliases,
      classifiers
    };

    this.resourcesService.term.update(this.mcTerm.terminology.id, resource.id, resource).subscribe(() => {
      if (this.afterSave) {
        this.afterSave(this.mcTerm);
      }
      this.messageHandler.showSuccess('Term updated successfully.');
      this.editingService.stop();
      this.editableForm.visible = false;
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.broadcastSvc.broadcast('$reloadFoldersTree');
    }, error => {
      this.messageHandler.showError('There was a problem updating the Term.', error);
    }
    );
  };

  showForm() {
    this.editingService.start();
    this.editableForm.show();
  }

  toggleFavourite() {
    if (this.favouriteHandler.toggle(this.mcTerm)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.mcTerm);
    }
  }

  public loadHelp() {
    this.helpDialogueService.open('Term_details');
  }

  private invokeInlineEditor(): void {
    this.editForm.find((inlineEditorComponent: any) => {
        return inlineEditorComponent.name === 'editableText';
      }
    );
  }
}
