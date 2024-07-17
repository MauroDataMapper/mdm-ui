/*
Copyright 2020-2024 University of Oxford and NHS England

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
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CatalogueItem, Pathable } from '@maurodatamapper/mdm-resources';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementSelectorDialogueService } from '@mdm/services/element-selector-dialogue.service';
import { MessageService } from '@mdm/services/message.service';
import { PathNameService } from '@mdm/shared/path-name/path-name.service';
import { EventObj } from 'jodit-angular/lib/Events';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter } from 'rxjs/operators';
import { HtmlParserService } from '../html-parser/html-parser.service';

const basicButtons = [
  'bold',
  'italic',
  'underline',
  '|',
  'ul',
  'ol',
  'eraser',
  '|',
  'outdent',
  'indent',
  '|',
  'font',
  'fontsize',
  'brush',
  'paragraph'
];

const standardButtons = [
  'source',
  '|',
  'bold',
  'italic',
  'underline',
  '|',
  'ul',
  'ol',
  'eraser',
  '|',
  'outdent',
  'indent',
  '|',
  'font',
  'fontsize',
  'brush',
  'paragraph',
  '|',
  'table',
  'link',
  'component:linktoelement', // See HtmlEditorComponent.buildCustomButtonsToolbar()
  'component:searchelement', // See HtmlEditorComponent.buildCustomButtonsToolbar()
  '|',
  'align',
  '\n',
  'undo',
  'redo',
  '|',
  'hr',
  'copyformat',
  'fullsize'
];

export enum HtmlButtonMode {
  Standard,
  Basic
}

@Component({
  selector: 'mdm-html-editor',
  templateUrl: './html-editor.component.html'
})
export class HtmlEditorComponent implements OnInit, OnChanges {
  /* Inputs for manual properties */
  @Input() inEditMode: boolean;
  @Input() description: string;
  @Output() descriptionChange = new EventEmitter<string>();

  /**
   * Root catalogue element that can be optionally used to assist with autocomplete search.
   */
  @Input() rootElement?: CatalogueItem;

  @Input() buttonMode: HtmlButtonMode;
  ButtonModeType = HtmlButtonMode;

  editorConfig: object;

  displayContent = '';

  private elementSelectorSubscription: Subscription;

  constructor(
    private elementDialogService: ElementSelectorDialogueService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private pathNames: PathNameService,
    private resources: MdmResourcesService,
    private htmlParser: HtmlParserService
  ) {}

  get allowAutocompleteSearch() {
    return (
      this.rootElement &&
      this.resources.getSearchableResource(this.rootElement.domainType)
    );
  }

  ngOnInit(): void {
    const buttons = this.buildCustomButtonsToolbar(
      this.buttonMode === HtmlButtonMode.Basic ? basicButtons : standardButtons
    );

    this.editorConfig = {
      buttons,
      buttonsMD: buttons,
      buttonsSM: buttons,
      buttonsXS: buttons
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.description) {
      if (this.inEditMode) {
        // Nothing to display because the edit control is being used
        this.displayContent = '';
        return;
      }

      // Intercept the HTML content to render for display only so that certain parts can be altered
      // The version or branch override will try to force all Mauro path links to work within the same context as
      // the containing model the root element is in, if available
      this.displayContent = this.htmlParser.parseAndModify(this.description, {
        versionOrBranchOverride: this.getVersionOrBranchOverride()
      });
    }
  }

  onHtmlEditorChanged(event: EventObj) {
    this.description = event.editor.value;
    this.descriptionChange.emit(this.description);
  }

  onHtmlEditorKeydown(event: EventObj) {
    const keyEvent = event.args[0] as KeyboardEvent;

    if (this.rootElement && keyEvent.ctrlKey && keyEvent.code === 'Space') {
      keyEvent.stopPropagation();
      this.onElementSearch(this, event.editor);
    }
  }

  /**
   * Requires a reference to the HtmlEditorComponent to get correct scope
   */
  onAddElementLink(component: HtmlEditorComponent, editor: any) {
    if (component.elementSelectorSubscription) {
      component.elementSelectorSubscription.unsubscribe();
      component.elementSelectorSubscription = null;
    }

    const focusNode = editor.selection.sel.focusNode;

    component.elementSelectorSubscription = component.messageService.elementSelector.subscribe(
      (element: MauroItem & Pathable) => {
        if (!element) {
          return;
        }

        this.createAndInsertLink(this, editor, focusNode, element);
      }
    );

    component.elementDialogService.open([], []);
  }

  /**
   * Requires a reference to the HtmlEditorComponent to get correct scope
   */
  onElementSearch(component: HtmlEditorComponent, editor: any) {
    if (!component.allowAutocompleteSearch) {
      return;
    }

    const focusNode = editor.selection.sel.focusNode;

    component.dialog
      .openElementSearch(component.rootElement)
      .afterClosed()
      .pipe(filter((response) => !!response?.selected))
      .subscribe((response) => {
        component.createAndInsertLink(
          component,
          editor,
          focusNode,
          response.selected
        );
      });
  }

  private createAndInsertLink(
    component: HtmlEditorComponent,
    editor: any,
    focusNode: any,
    element: MauroItem & Pathable
  ) {
    const path =
      element.path ?? component.pathNames.createFromBreadcrumbs(element);

    // The href will be the Mauro item path. This is not a valid URL, but the HtmlParserService will
    // automatically look for these paths in the content and rewrite them to correct URLs before
    // rendering for display
    const html = editor.create.fromHTML(
      `<a href='${path}' title='${element.label}'>${element.label}</a>`
    );

    editor.selection.setCursorIn(focusNode);
    editor.selection.insertHTML(html);

    return { path, element };
  }

  private buildCustomButtonsToolbar(buttons: string[]): any[] {
    if (!buttons || buttons.length === 0) {
      return [];
    }

    const customButtons = [
      {
        name: 'linktoelement',
        text: 'Link to Catalogue Item',
        tooltip: 'Add link to catalogue item',
        iconURL: 'assets/images/link-svgrepo-com.svg',
        exec: (editor: any) => this.onAddElementLink(this, editor)
      },
      {
        name: 'searchelement',
        text: 'Search for Catalogue Item',
        icon: 'search',
        exec: (editor: any) => this.onElementSearch(this, editor)
      }
    ];

    if (!this.allowAutocompleteSearch) {
      // Remove toolbar option for autocomplete search if no root element is available
      buttons = buttons.filter((b) => b !== 'component:searchelement');
    }

    // Map all button names in array except for custom buttons - identified by "component:[name]" syntax
    // These will then reference functions/properties from this component object
    return buttons.map(
      (button) =>
        customButtons.find((custom) => `component:${custom.name}` === button) ||
        button
    );
  }

  private getVersionOrBranchOverride() {
    if (!this.rootElement) {
      return undefined;
    }

    const pathableRootElement = (this.rootElement as unknown) as CatalogueItem &
      Pathable;

    if (!pathableRootElement.path) {
      return undefined;
    }

    const pathElements = this.pathNames.parse(pathableRootElement.path);
    return this.pathNames.getVersionOrBranchName(pathElements);
  }
}
