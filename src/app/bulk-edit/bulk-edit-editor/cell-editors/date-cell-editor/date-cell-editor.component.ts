import { Component } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';

@Component({
  selector: 'mdm-date-cell-editor',
  templateUrl: './date-cell-editor.component.html',
  styleUrls: ['./date-cell-editor.component.scss']
})
export class DateCellEditorComponent implements ICellEditorAngularComp {
  params: ICellEditorParams;
  value: string;

  agInit(params: any): void {
    this.params = params;
    this.value = this.params.value;
  }

  getValue() {
    return this.value;
  }
}
