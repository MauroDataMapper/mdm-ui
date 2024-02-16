/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { VersioningGraphModalConfiguration } from './versioning-graph-modal.model';
import { MergableCatalogueItem } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-versioning-graph-modal',
  templateUrl: './versioning-graph-modal.component.html',
  styleUrls: ['./versioning-graph-modal.component.scss']
})
export class VersioningGraphModalComponent implements OnInit {
  catalogueItem: MergableCatalogueItem;

  constructor(
    public dialogRef: MatDialogRef<VersioningGraphModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VersioningGraphModalConfiguration) { }

  ngOnInit() {
    this.catalogueItem = this.data.catalogueItem;
  }
}
