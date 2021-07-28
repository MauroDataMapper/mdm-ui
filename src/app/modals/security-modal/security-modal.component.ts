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
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CatalogueItem, SecurableModel } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { SecurityAccessResource, SecurityModalConfiguration } from './security-modal.model';

@Component({
  selector: 'mdm-security-modal',
  templateUrl: './security-modal.component.html',
  styleUrls: ['./security-modal.component.scss']
})
export class SecurityModalComponent implements OnInit {
  element: CatalogueItem & SecurableModel;
  resource: SecurityAccessResource;
  canAddGroups = true;

  constructor(
    private dialogRef: MatDialogRef<SecurityModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SecurityModalConfiguration
  ) { }

  ngOnInit(): void {
    this.element = this.data.element;
    this.resource = this.data.resource;
  }

  close() {
    this.dialogRef.close(ModalDialogStatus.Close);
  }
}
