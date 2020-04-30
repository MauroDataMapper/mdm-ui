import {
  Component,
  OnInit,
  Input,
  QueryList,
  ViewChildren,
  ContentChildren,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { ResourcesService } from '@mdm/services/resources.service';
import { MessageService } from '@mdm/services/message.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { FolderHandlerService } from '@mdm/services/handlers/folder-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { SharedService } from '@mdm/services/shared.service';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { Editable, FolderResult } from '@mdm/model/folderModel';
import { Subscription } from 'rxjs';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown-text-area.component';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { DialogPosition } from '@angular/material/dialog';

@Component({
  selector: 'mdm-classification-details',
  templateUrl: './classification-details.component.html',
  styleUrls: ['./classification-details.component.sass']
})
export class ClassificationDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
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
  processing = false;

  @Input() afterSave: any;
  @Input() editMode = false;
  @Input() mcClassification = false;

  @ViewChildren('editableText') editForm: QueryList<any>;
  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;

  constructor(
    private resourcesService: ResourcesService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private folderHandler: FolderHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private elementDialogueService: ElementSelectorDialogueService,
    private broadcaseSvc: BroadcastService
  ) {
    // securitySection = false;
    this.isAdminUser = this.sharedService.isAdmin;
    this.isLoggedIn = this.securityHandler.isLoggedIn();
    this.ClassifierDetails();
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

    // this.subscription = this.messageService.editMode.subscribe((message: boolean) => {
    //     this.showEditMode = message;
    // });
  }

  ngAfterViewInit(): void {
    // Subscription emits changes properly from component creation onward & correctly invokes `this.invokeInlineEditor` if this.inlineEditorToInvokeName is defined && the QueryList has members
    this.editForm.changes.subscribe((queryList: QueryList<any>) => {
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
    const inlineEditorToInvoke = this.editForm.find(
      (inlineEditorComponent: any) => {
        return inlineEditorComponent.name === 'editableText';
      }
    );
    // console.log(inlineEditorToInvoke.state);  // OUTPUT: InlineEditorState {value: "Some Value", disabled: false, editing: false, empty: false}
    //  if (inlineEditorToInvoke) {
    //      inlineEditorToInvoke.edit({editing: true, focus: true, select: true});
    //  }
    // console.log(inlineEditorToInvoke.state); // OUTPUT: InlineEditorState {value: "Some Value", disabled: false, editing: true, empty: false}
  }

  // private onInlineEditorEdit(editEvent: InlineEditorEvent): void {
  //     console.log(editEvent); // OUTPUT: Only logs event when inlineEditor appears in template
  // }

  ClassifierDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(
      serverResult => {
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
      this.broadcaseSvc.broadcast('$reloadFoldersTree');
    });
  }

  formBeforeSave = function() {
    this.editMode = false;
    this.errorMessage = '';
    this.editForm.forEach(x => (this.result.label = x.getHotState().value));

    const resource = {
      id: this.result.id,
      label: this.result.label,
      description: this.editableForm.description
    };

    if (this.validateLabel(this.result.label)) {
      this.resourcesService.classifier
        .put(resource.id, null, { resource })
        .subscribe(
          result => {
            if (this.afterSave) {
              this.afterSave(result);
            }
            this.messageHandler.showSuccess('Classifier updated successfully.');
            this.editableForm.visible = false;
            this.editForm.forEach(x => x.edit({ editing: false }));
          },
          error => {
            this.messageHandler.showError(
              'There was a problem updating the Classifier.',
              error
            );
          }
        );
    }
  };

  validateLabel(data): any {
    if (!data || (data && data.trim().length === 0)) {
      this.errorMessage = 'Classification Label can not be empty';
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

  delete() {
    this.resourcesService.dataClass
      .delete(
        this.result.parentDataModel,
        this.result.parentDataClass,
        this.result.id
      )
      .subscribe(
        result => {
          this.messageHandler.showSuccess('Data Class deleted successfully.');
          this.stateHandler.Go(
            'dataModel',
            {
              id: this.result.parentDataModel,
              reload: true,
              location: true
            },
            null
          );
          this.broadcaseSvc.broadcast('$reloadFoldersTree');
        },
        error => {
          this.deleteInProgress = false;
          this.messageHandler.showError(
            'There was a problem deleting the Data Model.',
            error
          );
        }
      );
  }
}
