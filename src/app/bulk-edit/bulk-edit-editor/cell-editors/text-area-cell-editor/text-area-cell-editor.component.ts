import { Component, ElementRef, ViewChild } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';

interface TextAreaCellEditorParams {
  rows?: number;
  cols?: number;
}

@Component({
  selector: 'mdm-text-area-cell-editor',
  templateUrl: './text-area-cell-editor.component.html',
  styleUrls: ['./text-area-cell-editor.component.scss']
})
export class TextAreaCellEditorComponent implements ICellEditorAngularComp {
  @ViewChild('valueInput') textArea: ElementRef<HTMLTextAreaElement>;

  params: ICellEditorParams & TextAreaCellEditorParams;
  value: string;

  private focusAfterAttached = false;

  agInit(params: ICellEditorParams & TextAreaCellEditorParams): void {
    this.params = params;
    this.value = this.params.value;
    this.focusAfterAttached = this.params.cellStartedEdit;
  }

  afterGuiAttached(): void {
    if (this.focusAfterAttached) {
      this.textArea.nativeElement.focus();
    }
  }

  getValue() {
    return this.value;
  }

  isPopup(): boolean {
    return true;
  }

  getPopupPosition(): string {
    return 'under';
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.shiftKey) {
      event.stopPropagation();
    }
  }
}
