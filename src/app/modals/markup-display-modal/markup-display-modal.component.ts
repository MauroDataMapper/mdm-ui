import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mdm-markup-display-modal',
  templateUrl: './markup-display-modal.component.html',
  styleUrls: ['./markup-display-modal.component.scss']
})
export class MarkupDisplayModalComponent implements OnInit {

  title :string;

  constructor(    public dialogRef: MatDialogRef<MarkupDisplayModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MarkDisplayModalData
  ) { }

  ngOnInit(): void {
    this.title = this.data.title;
  }

  close() {
    this.dialogRef.close();
  }

}

export class MarkDisplayModalData
{
  content:any;
  title:string;
}
