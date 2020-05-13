// @ts-ignore
import { FolderResult, Editable } from '../model/folderModel';
import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ViewChildren,
  QueryList,
  ContentChildren,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageService } from '../services/message.service';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';
import { MarkdownTextAreaComponent } from '../utility/markdown-text-area.component';
import { FolderHandlerService } from '../services/handlers/folder-handler.service';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { SharedService } from '../services/shared.service';
import { BroadcastService } from '../services/broadcast.service';
import { DialogPosition } from '@angular/material/dialog';
import { ElementSelectorDialogueService } from '../services/element-selector-dialogue.service';
import { Title } from '@angular/platform-browser';
import { ResourcesService } from '../services/resources.service';
import { MessageHandlerService } from '../services/utility/message-handler.service';

@Component({
  selector: 'mdm-folder-detail',
  templateUrl: './folder-detail.component.html',
  styleUrls: ['./folder-detail.component.css']
})
export class FolderDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  result: FolderResult;
  hasResult = false;
  subscription: Subscription;

  showUserGroupAccess: boolean;
  showEdit: boolean;
  showPermission: boolean;
  showDelete: boolean;
  isAdminUser: boolean;
  isLoggedIn: boolean;
  deleteInProgress: boolean;
  exporting: boolean;
  editableForm: Editable;
  errorMessage = '';
  showEditMode = false;
  processing: boolean;

  @Input() afterSave: any;
  @Input() editMode = false;

  @ViewChildren('editableText') editForm: QueryList<any>;
  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;

  constructor(
    private resourcesService: ResourcesService,
    private messageService: MessageService,
    private securityHandler: SecurityHandlerService,
    private messageHandlerService: MessageHandlerService ,
    private folderHandler: FolderHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private elementDialogueService: ElementSelectorDialogueService,
    private broadcastSvc: BroadcastService,
    private title: Title
  ) {
    // securitySection = false;
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.FolderDetails();
  }

  public showAddElementToMarkdown() {
    // Remove from here & put in markdown
    this.elementDialogueService.open(
      'Search_Help',
      'left' as DialogPosition,
      null,
      null
    );
  }

  ngOnInit() {
    this.editableForm = new Editable();
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
      this.editForm.forEach(x => x.edit({ editing: false }));
      this.errorMessage = '';
      this.editableForm.label = this.result.label;
      this.editableForm.visible = false;
      this.editableForm.validationError = false;
      this.editableForm.description = this.result.description;
    };
  }

  ngAfterViewInit(): void {
    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    this.editForm.changes.subscribe(() => {
      this.invokeInlineEditor();
      // setTimeout work-around prevents Angular change detection `ExpressionChangedAfterItHasBeenCheckedError` https://blog.angularindepth.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4

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

  private invokeInlineEditor(): void {
    // console.log(inlineEditorToInvoke.state);  // OUTPUT: InlineEditorState {value: "Some Value", disabled: false, editing: false, empty: false}
    //  if (inlineEditorToInvoke) {
    //      inlineEditorToInvoke.edit({editing: true, focus: true, select: true});
    //  }
    // console.log(inlineEditorToInvoke.state); // OUTPUT: InlineEditorState {value: "Some Value", disabled: false, editing: true, empty: false}
  }

  // private onInlineEditorEdit(editEvent: InlineEditorEvent): void {
  //     console.log(editEvent); // OUTPUT: Only logs event when inlineEditor appears in template
  // }

  FolderDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(serverResult => {
        this.result = serverResult;
        this.editableForm.label = this.result.label;
        this.editableForm.description = this.result.description;
        const access: any = this.securityHandler.folderAccess(this.result);
        this.showEdit = access.showEdit;
        this.showPermission = access.showPermission;
        this.showDelete = access.showDelete;
        if (this.result != null) {
          this.hasResult = true;
          this.watchFolderObject();
        }
        this.title.setTitle(`Folder - ${this.result?.label}`);
      }
    );
  }

  watchFolderObject() {
    const access = this.securityHandler.folderAccess(this.result);
    this.showEdit = access.showEdit;
    this.showPermission = access.showPermission;
    this.showDelete = access.showDelete;
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

  askForSoftDelete() {
    if (!this.securityHandler.isAdmin()) {
      return;
    }

    this.folderHandler.askForSoftDelete(this.result.id).then(() => {
      this.stateHandler.reload();
    });
  }

  askForPermanentDelete(): any {
    if (!this.securityHandler.isAdmin()) {
      return;
    }

    this.folderHandler.askForPermanentDelete(this.result.id).then(() => {
      this.broadcastSvc.broadcast('$reloadFoldersTree');
    });
  }

  formBeforeSave = function() {
    this.editMode = false;
    this.errorMessage = '';

    const resource = {
      id: this.result.id,
      label: this.editableForm.label,
      description: this.editableForm.description
    };

    if (this.validateLabel(this.result.label)) {
      this.resourcesService.folder
        .put(resource.id, null, { resource })
        .subscribe(
          result => {
            if (this.afterSave) {
              this.afterSave(result);
            }
            this.messageHandlerService.showSuccess('Folder updated successfully.');
            this.editableForm.visible = false;
            this.editForm.forEach(x => x.edit({ editing: false }));
          },
          error => {
            this.messageHandler.showError(
              'There was a problem updating the Folder.',
              error
            );
          }
        );
    }
  };

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'DataModel name can not be empty';
      return false;
    } else {
      return true;
    }
  }

  showForm() {
    this.editableForm.show();
  }

  onCancelEdit() {
    this.editMode = false; // Use Input editor whe adding a new folder.
    this.errorMessage = '';
  }

  onLabelChange(value: any) {
    if (!this.validateLabel(value)) {
      this.editableForm.validationError = true;
    } else {
      this.editableForm.validationError = false;
    }
  }
}
