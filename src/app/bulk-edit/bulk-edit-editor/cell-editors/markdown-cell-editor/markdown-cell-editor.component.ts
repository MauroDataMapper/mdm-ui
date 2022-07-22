import { Component } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';

@Component({
  selector: 'mdm-markdown-cell-editor',
  templateUrl: './markdown-cell-editor.component.html',
  styleUrls: ['./markdown-cell-editor.component.scss']
})
export class MarkdownCellEditorComponent implements ICellEditorAngularComp {
  params: ICellEditorParams;
  value: string;

  agInit(params: ICellEditorParams): void {
    this.params = params;
    this.value = this.params.value;
  }

  getValue() {
    return this.value;
  }
}
