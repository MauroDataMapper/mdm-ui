/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
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
