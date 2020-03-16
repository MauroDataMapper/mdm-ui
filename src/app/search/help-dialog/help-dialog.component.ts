import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'mdm-help-dialog',
  templateUrl: './help-dialog.component.html',

})
export class HelpDialogComponent {

    constructor(public dialogRef: MatDialogRef<HelpDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

    closeHelp(): void {
        this.dialogRef.close();
    }

}
