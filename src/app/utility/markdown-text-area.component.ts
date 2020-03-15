import { Component, OnInit, Input,   ViewChild, Output, ElementRef, EventEmitter } from '@angular/core';
import { FolderResult } from '../model/folderModel';
import { MarkdownParserService } from './markdown-parser.service';
import { ElementSelectorDialogueService } from '../services/element-selector-dialogue.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'markdown-text-area',
  templateUrl: './markdown-text-area.component.html'
  // styleUrls: ['./markdown-text-area.component.sass']
})
export class MarkdownTextAreaComponent implements OnInit {
  @Output() descriptionChange = new EventEmitter<string>();

  descriptionVal: string;

  @Input()
  get description() {
    return this.descriptionVal;
  }

  set description(val) {
    this.descriptionVal = val;
    if (val === null || val === undefined) {
      this.formData.description = '';
    } else {
      this.formData.description = val;
    }
    this.descriptionChange.emit(this.descriptionVal);
  }

  @Input('in-edit-mode') inEditMode: boolean;
  @Input('hide-help-text') hideHelpText: boolean;
  @Input('editable-form') editableForm: any;
  @Input() rows: number;
  @Input('property') property: string;
  @Input('element') element: FolderResult;
  elementDialogue;

  @ViewChild('editableTextArea', { static: false })
  editableTextArea: ElementRef;

  @ViewChild('editableText', { static: true }) editForm: any;

  lastWasShiftKey: any;
  formData: any = {
    showMarkDownPreview: Boolean,
    description: String
  };
  currentShiftKey: any;
  selectedElement: any;
  desc;

  constructor(
    private markdownParser: MarkdownParserService,
    private elementDialogueService: ElementSelectorDialogueService,
    private messageService: MessageService
  ) {
    // this.formData.description = this.editableForm["description"];
  }

  ngOnInit() {
    this.lastWasShiftKey = null;
    this.formData.showMarkDownPreview = false;
    if (!this.editableForm) {
      this.formData.description = this.description;
    } else {
      this.formData.description = this.editableForm.description;
    }

    this.elementSelected();
  }

  public descriptionKeyUp($event) {
    $event.stopImmediatePropagation();

    this.currentShiftKey = $event.keyCode === 16;

    if (this.lastWasShiftKey && this.currentShiftKey) {
      // this.showAddElementToMarkdown();
      this.lastWasShiftKey = false;
      return;
    }

    if (this.currentShiftKey) {
      this.lastWasShiftKey = true;
    } else {
      this.lastWasShiftKey = false;
    }
  }

  public showAddElementToMarkdown() {
    this.elementDialogue = this.elementDialogueService.open([], [], null, null);
  }

  public elementSelected() {
    this.messageService.elementSelector.subscribe(data => {
      this.selectedElement = data;
      if (this.selectedElement != null) {
        const markdownLink = this.markdownParser.createMarkdownLink(
          this.selectedElement
        );
        if (this.editableTextArea) {
          const startPos = this.editableTextArea.nativeElement.selectionStart;
          this.editableTextArea.nativeElement.focus();

          this.editableTextArea.nativeElement.value = this.editableTextArea.nativeElement.value.substr(0, this.editableTextArea.nativeElement.selectionStart) + ' ' + markdownLink + ' ' + this.editableTextArea.nativeElement.value.substr(this.editableTextArea.nativeElement.selectionStart, this.editableTextArea.nativeElement.value.length);

          this.editableTextArea.nativeElement.selectionStart = startPos;
          this.editableTextArea.nativeElement.focus();
          if (this.editableForm) {
            this.editableForm.description = this.editableTextArea.nativeElement.value;
          } else {
            this.description = this.editableTextArea.nativeElement.value;
          }
        }
      }
    });
  }

  onDescriptionChange = () => {
    if (!this.editableForm) {
      this.description = this.formData.description;
    }
  };
}
