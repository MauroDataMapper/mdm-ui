import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  Input, OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {EditableDataModel} from '@mdm/model/dataModelModel';
import {from, Subscription} from 'rxjs';
import {MarkdownTextAreaComponent} from '@mdm/utility/markdown-text-area.component';
import {ResourcesService} from '@mdm/services/resources.service';
import {MessageService} from '@mdm/services/message.service';
import {MessageHandlerService} from '@mdm/services/utility/message-handler.service';
import {SecurityHandlerService} from '@mdm/services/handlers/security-handler.service';
import {StateHandlerService} from '@mdm/services/handlers/state-handler.service';
import {SharedService} from '@mdm/services/shared.service';
import {ElementSelectorDialogueService} from '@mdm/services/element-selector-dialogue.service';
import {BroadcastService} from '@mdm/services/broadcast.service';
import {HelpDialogueHandlerService} from '@mdm/services/helpDialogue.service';
import {FavouriteHandlerService} from '@mdm/services/handlers/favourite-handler.service';
import {ConfirmationModalComponent} from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import {CodeSetResult} from '@mdm/model/codeSetModel';
import {DialogPosition, MatDialog} from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-code-set-details',
  templateUrl: './code-set-details.component.html',
  styleUrls: ['./code-set-details.component.scss']
})
export class CodeSetDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

  result: CodeSetResult;
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
  exporting: boolean;
  editableForm: EditableDataModel;
  errorMessage = '';
  showEditMode = false;
  processing = false;
  showNewVersion = false;
  compareToList = [];
  exportError = null;
  exportedFileIsReady = false;
  exportList = [];
  addedToFavourite = false;
  @ViewChild('aLink', {static: false}) aLink: ElementRef;
  download: any;
  downloadLink: any;
  urlText: any;
  @Input() afterSave: any;
  @Input() editMode = false;

  @ViewChildren('editableText') editForm: QueryList<any>;
  @ViewChildren('editableTextAuthor') editFormAuthor: QueryList<any>;
  @ViewChildren('editableTextOrganisation') editFormOrganisation: QueryList<any>;

  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;

  constructor(private resourcesService: ResourcesService,
              private messageService: MessageService,
              private messageHandler: MessageHandlerService,
              private securityHandler: SecurityHandlerService,
              private stateHandler: StateHandlerService,
              private sharedService: SharedService,
              private elementDialogueService: ElementSelectorDialogueService,
              private broadcastSvc: BroadcastService,
              private helpDialogueService: HelpDialogueHandlerService,
              private dialog: MatDialog,
              private favouriteHandler: FavouriteHandlerService,
              private title: Title) {
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.CodeSetDetails();
  }

  public showAddElementToMarkdown() { // Remove from here & put in markdown
    this.elementDialogueService.open('Search_Help', 'left' as DialogPosition, null, null);
  }

  ngOnInit() {
    this.editableForm = new EditableDataModel();
    this.editableForm.visible = false;
    this.editableForm.deletePending = false;


    this.editableForm.show = () => {
      this.editForm.forEach(x => x.edit({
        editing: true,
        focus: x._name === 'moduleName' ? true : false
      }));
      this.editableForm.visible = true;
    };

    this.editableForm.cancel = () => {
      this.editForm.forEach(x => x.edit({editing: false}));
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.errorMessage = '';
      this.editableForm.description = this.result.description;
      if (this.result.classifiers) {
        this.result.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.result.aliases) {
        this.result.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }

    };

    this.subscription = this.messageService.changeUserGroupAccess.subscribe((message: boolean) => {
      this.showSecuritySection = message;
    });
  }

  ngAfterViewInit(): void {

    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    // this.editForm.changes
    //     .subscribe((queryList: QueryList<InlineEditorComponent>) => {
    //       this.invokeInlineEditor();
    //       // setTimeout work-around prevents Angular change detection `ExpressionChangedAfterItHasBeenCheckedError` https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4
    //
    //       if (this.editMode) {
    //         this.editForm.forEach(x => x.edit({ editing: true,
    //           focus: x._name === "moduleName" ? true : false
    //         }));
    //         this.showForm();
    //       }
    //     });
  }

  private invokeInlineEditor(): void {
    // const inlineEditorToInvoke = this.editForm.find(
    //     (inlineEditorComponent: InlineEditorComponent) => {
    //       return inlineEditorComponent.name === "editableText";
    //     });

  }

  // private onInlineEditorEdit(editEvent: InlineEditorEvent): void {
  //     console.log(editEvent); // OUTPUT: Only logs event when inlineEditor appears in template
  // }

  CodeSetDetails(): any {

    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
      this.result = serverResult;
      this.editableForm.description = this.result.description;
      if (this.result.classifiers) {
        this.result.classifiers.forEach(item => {
          this.editableForm.classifiers.push(item);
        });
      }
      if (this.result.aliases) {
        this.result.aliases.forEach(item => {
          this.editableForm.aliases.push(item);
        });
      }
      if (this.result.semanticLinks) {
        this.result.semanticLinks.forEach(link => {
          if (link.linkType === 'New Version Of') {
            this.compareToList.push(link.target);
          }
        });
      }

      if (this.result.semanticLinks) {
        this.result.semanticLinks.forEach(link => {
          if (link.linkType === 'Superseded By') {
            this.compareToList.push(link.target);
          }
        });
      }


      if (this.result != null) {
        this.hasResult = true;
        this.watchDataModelObject();
      }
      this.title.setTitle(`Code Set - ${this.result?.label}`);
    });
  }

  watchDataModelObject() {
    const access: any = this.securityHandler.elementAccess(this.result);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
      this.showPermission = access.showPermission;
      this.showDelete = access.showDelete;
      this.showFinalise = access.showFinalise;
      this.showNewVersion = access.showNewVersion;
    }
    this.addedToFavourite = this.favouriteHandler.isAdded(this.result);

  }

  toggleSecuritySection() {
    this.messageService.toggleUserGroupAccess();
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  delete(permanent) {
    if (!this.securityHandler.isAdmin()) {
      return;
    }
    const queryString = permanent ? 'permanent=true' : null;
    this.deleteInProgress = true;

    this.resourcesService.codeSet.delete(this.result.id, null, queryString, null).subscribe(result => {
        if (permanent) {
          this.broadcastSvc.broadcast('$reloadFoldersTree');
          this.stateHandler.Go('allDataModel', {reload: true, location: true}, null);
        } else {
          this.broadcastSvc.broadcast('$reloadFoldersTree');
          this.stateHandler.reload();
        }

      },
      error => {
        this.deleteInProgress = false;
        this.messageHandler.showError('There was a problem deleting the Code Set.', error);
      });

  }

  askForSoftDelete() {
    if (!this.securityHandler.isAdmin()) {
      return;
    }
    const promise = new Promise((resolve, reject) => {

      const dialog = this.dialog.open(ConfirmationModalComponent,
        {
          data: {
            title: 'Code Set',
            message:
              'Are you sure you want to delete this Code Set?<br>The Code Set will be marked as deleted and will not be viewable by users except Administrators.'
          }
        });

      dialog.afterClosed().subscribe(result => {
        if (result.status !== 'ok') {
          // reject("cancelled");
          return promise;
        }
        this.processing = true;
        this.delete(false);
        this.processing = false;
      });
    });
    return promise;
  }

  askForPermanentDelete(): any {
    if (!this.securityHandler.isAdmin()) {
      return;
    }
    const promise = new Promise((resolve, reject) => {
      const dialog = this.dialog.open(ConfirmationModalComponent,
        {
          data: {
            title: 'Code Set',
            message: 'Are you sure you want to <span class=\'errorMessage\'>permanently</span> delete this Code Set?'
          }
        });

      dialog.afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return;
        }
        const dialog2 = this.dialog.open(ConfirmationModalComponent,
          {
            data: {
              title: 'Data Model',
              message: '<strong>Are you sure?</strong><br>It will be deleted <span class=\'errorMessage\'>permanently</span>.'
            }
          });

        dialog2.afterClosed().subscribe(result2 => {
          if (result2.status !== 'ok') {
            return;
          }
          this.delete(true);
        });

      });
    });

    return promise;
  }


  formBeforeSave = () => {
    this.editMode = false;
    this.errorMessage = '';
    // this.editForm.forEach(x => this.result["label"] = x.getHotState().value);
    this.editForm.forEach((modules) => {
      if (modules.config.name === 'moduleName') {
        this.result.label = modules.getHotState().value;
      }
      if (modules.config.name === 'moduleNameAuthor') {
        this.result.author = modules.getHotState().value;
      }
      if (modules.config.name === 'moduleNameOrganisation') {
        this.result.organisation = modules.getHotState().value;
      }

    });

    const classifiers = [];
    this.editableForm.classifiers.forEach(cls => {
      classifiers.push(cls);
    });
    const aliases = [];
    this.editableForm.aliases.forEach(alias => {
      aliases.push(alias);
    });
    const resource = {
      id: this.result.id,
      label: this.result.label,
      description: this.editableForm.description,
      author: this.result.author,
      organisation: this.result.organisation,
      aliases,
      classifiers

    };

    if (this.validateLabel(this.result.label)) {


      const call = from(this.resourcesService.codeSet.put(resource.id, null, {resource})).subscribe(result => {
          if (this.afterSave) {
            this.afterSave(result);
          }
          this.messageHandler.showSuccess('Code Set updated successfully.');
          this.editableForm.visible = false;
          this.editForm.forEach(x => x.edit({editing: false}));

        },
        error => {
          this.messageHandler.showError('There was a problem updating the Code Set.', error);
        });
    }


  };

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'Code Set name can not be empty';
      return false;
    } else {
      return true;
    }
  }

  showForm() {

    this.editableForm.show();

  }

  onCancelEdit() {
    this.errorMessage = '';
    this.editMode = false; // Use Input editor whe adding a new folder.
  }

  public loadHelp() {
    this.helpDialogueService.open('Edit_model_details', {my: 'right top', at: 'bottom'} as DialogPosition);
  }

  toggleFavourite() {
    if (this.favouriteHandler.toggle(this.result)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.result);
    }

  }

  finalise() {
    const self = this;

    const promise = new Promise((resolve, reject) => {

      const dialog = this.dialog.open(ConfirmationModalComponent,
        {
          data: {
            title: 'Are you sure you want to finalise the Code Set ?',
            message:
              'Once you finalise a CodeSet, you can not edit it anymore!<br>\ \n' +
              'but you can create new version of it.'
          }
        });

      dialog.afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          // reject("cancelled");
          return promise;
        }
        this.processing = true;
        this.resourcesService.codeSet.put(this.result.id, 'finalise', null).subscribe(result2 => {
            this.processing = false;
            this.messageHandler.showSuccess('Code Set finalised successfully.');
            this.stateHandler.Go('codeset', {id: this.result.id}, {reload: true});

          },
          error => {
            this.processing = false;
            this.messageHandler.showError('There was a problem finalising the CodeSet.', error);
          });

      });
    });
    return promise;
  }


  onLabelChange(value: any) {
    if (!this.validateLabel(value)) {
      this.editableForm.validationError = true;
    } else {
      this.editableForm.validationError = false;
      this.errorMessage = '';
    }

  }

}
