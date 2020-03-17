import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { TermResult, EditableTerm } from '../../model/termModel';
import { from, Subscription } from 'rxjs';
import { MarkdownTextAreaComponent } from '../../utility/markdown-text-area.component';
import { ResourcesService } from '../../services/resources.service';
import { MessageService } from '../../services/message.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { SecurityHandlerService } from '../../services/handlers/security-handler.service';
import { FolderHandlerService } from '../../services/handlers/folder-handler.service';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { SharedService } from '../../services/shared.service';
import { ElementSelectorDialogueService } from '../../services/element-selector-dialogue.service';
import { BroadcastService } from '../../services/broadcast.service';
import { HelpDialogueHandlerService } from '../../services/helpDialogue.service';
import { FavouriteHandlerService } from '../../services/handlers/favourite-handler.service';
import { ExportHandlerService } from '../../services/handlers/export-handler.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, DialogPosition } from '@angular/material/dialog';

@Component({
  selector: 'mdm-term-details',
  templateUrl: './term-details.component.html',
  styleUrls: ['./term-details.component.scss']
})
export class TermDetailsComponent implements OnInit, AfterViewInit {
  securitySection = false;
  processing = false;
  exportError = null;
  exportList = [];
  // isAdminUser = $rootScope.isAdmin();
  // isLoggedIn = securityHandler.isLoggedIn();
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
  @ViewChild('aLink', { static: false }) aLink: ElementRef;
  download: any;
  downloadLink: any;
  urlText: any;
  @Input() afterSave: any;
  @Input() editMode = false;
  mcTerm: TermResult;
  @Input() mcTerminology: any;
  @Input() hideEditButton: any;
  @Input() openEditForm: any;

  @ViewChildren('editableText') editForm: QueryList<any>;
  @ViewChildren('editableTextAuthor') editFormAuthor: QueryList<any>;
  @ViewChildren('editableTextOrganisation') editFormOrganisation: QueryList<
    any
  >;

  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;
  constructor(
    private renderer: Renderer2,
    private resourcesService: ResourcesService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private securityHandler: SecurityHandlerService,
    private folderHandler: FolderHandlerService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private elementDialogueService: ElementSelectorDialogueService,
    private broadcastSvc: BroadcastService,
    private helpDialogueService: HelpDialogueHandlerService,
    private dialog: MatDialog,
    private favouriteHandler: FavouriteHandlerService,
    private exportHandler: ExportHandlerService,
    private domSanitizer: DomSanitizer
  ) {
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

    // this.subscription = this.messageService.changeUserGroupAccess.subscribe((message: boolean) => {
    //   this.showSecuritySection = message;
    // });
    // this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
    //   this.showSearch = message;
    // });
  }

  TermDetails(): any {
    this.subscription = this.messageService.dataChanged$.subscribe(
      serverResult => {
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

  formBeforeSave = function() {
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

    this.resourcesService.term
      .put(this.mcTerm.terminology.id, resource.id, null, { resource })
      .subscribe(
        result => {
          if (this.afterSave) {
            this.afterSave(this.mcTerm);
          }
          this.messageHandler.showSuccess('Term updated successfully.');
          this.editableForm.visible = false;
          this.editForm.forEach(x => x.edit({ editing: false }));
        },
        error => {
          this.messageHandler.showError(
            'There was a problem updating the Term.',
            error
          );
        }
      );
  };

  private invokeInlineEditor(): void {
    const inlineEditorToInvoke = this.editForm.find(
      (inlineEditorComponent: any) => {
        return inlineEditorComponent.name === 'editableText';
      }
    );
  }

  showForm() {
    this.editableForm.show();
  }

  toggleFavourite() {
    if (this.favouriteHandler.toggle(this.mcTerm)) {
      this.addedToFavourite = this.favouriteHandler.isAdded(this.mcTerm);
    }
  }

  public loadHelp() {
    this.helpDialogueService.open('Term_details', {
      my: 'right top',
      at: 'bottom'
    } as DialogPosition);
  }
}
