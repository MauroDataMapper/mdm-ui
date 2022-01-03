import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';

@Component({
  selector: 'mdm-checkbox-renderer',
  templateUrl: './checkbox-renderer.component.html',
  styleUrls: ['./checkbox-renderer.component.scss']
})
export class CheckboxRendererComponent implements ICellRendererAngularComp {

  params: any;

  agInit(params: any): void {
    this.params = params;
    if(typeof this.params.value === 'string')
    {
      this.params.value = this.params.value === 'true';
    }
  }

  checkedHandler(event) {
      const checked = event.target.checked;
      const colId = this.params.column.colId;
      this.params.node.setDataValue(colId, checked);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refresh(params: ICellRendererParams): boolean {
    return true;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }
}