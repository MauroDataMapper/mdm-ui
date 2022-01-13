import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'mdm-checkbox-cell-renderer',
  templateUrl: './checkbox-cell-renderer.component.html',
  styleUrls: ['./checkbox-cell-renderer.component.scss']
})
export class CheckboxCellRendererComponent implements ICellRendererAngularComp {

  params: ICellRendererParams;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    if (typeof this.params.value === 'string') {
      this.params.value = this.params.value === 'true';
    }
  }

  valueChanged(event: MatCheckboxChange) {
    const checked = event.checked;
    const colId = this.params.column.getColId();
    this.params.node.setDataValue(colId, checked);
  }

  refresh(): boolean {
    // Let agGrid handle refresh
    return false;
  }
}