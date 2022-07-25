import { Component } from '@angular/core';
import { ILoadingOverlayAngularComp } from 'ag-grid-angular';
import { Column, INoRowsOverlayParams, RowNode } from 'ag-grid-community';

export interface MarkdownEditOverlayParams {
  value: string;
  node: RowNode;
  column: Column;
}

@Component({
  selector: 'mdm-markdown-edit-overlay',
  templateUrl: './markdown-edit-overlay.component.html',
  styleUrls: ['./markdown-edit-overlay.component.scss']
})
export class MarkdownEditOverlayComponent
  implements ILoadingOverlayAngularComp {
  params: INoRowsOverlayParams & MarkdownEditOverlayParams;
  value: string;

  agInit(params: INoRowsOverlayParams & MarkdownEditOverlayParams): void {
    this.params = params;
    this.value = this.params.value;
  }

  close() {
    this.params.node.setDataValue(this.params.column, this.value);
    this.params.api.hideOverlay();
  }
}
