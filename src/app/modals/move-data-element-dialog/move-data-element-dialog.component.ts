import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CatalogueItemDomainType,
  DataClass,
  DataElement,
  MdmIndexResponse,
  MdmTreeItem,
  MdmTreeItemListResponse
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { EMPTY, catchError, finalize, map } from 'rxjs';

export interface MoveDataElementDialogPayload {
  dataElement: DataElement;
}

export interface MoveDataElementDialogResponse {
  status: ModalDialogStatus;
  destinationDataClass?: DataClass;
}

@Component({
  selector: 'mdm-move-data-element-dialog',
  templateUrl: './move-data-element-dialog.component.html',
  styleUrls: ['./move-data-element-dialog.component.scss']
})
export class MoveDataElementDialogComponent implements OnInit {
  dataElement: DataElement;
  dataClasses: MauroItem[];

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private dialogRef: MatDialogRef<
      MoveDataElementDialogComponent,
      MoveDataElementDialogResponse
    >,
    @Inject(MAT_DIALOG_DATA) public data: MoveDataElementDialogPayload
  ) {}

  ngOnInit(): void {
    this.dataElement = this.data.dataElement;
    this.loadDataClasses();
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  move() {
    this.dialogRef.close({
      status: ModalDialogStatus.Ok
      // TODO: destinationDataClass
    });
  }

  private loadDataClasses() {
    this.resources.dataClass
      .all(this.dataElement.model, {})
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem loading the data classes.',
            error
          );
          return EMPTY;
        }),
        map((response: MdmIndexResponse<MauroItem>) => response.body.items)
        //finalize(() => (this.loading = false))
      )
      .subscribe((dataClasses: MauroItem[]) => {
        this.dataClasses = dataClasses;
      });
  }
}
