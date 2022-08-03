/*
Copyright 2020-2022 University of Oxford
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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Exporter,
  ExporterIndexResponse,
  ExportQueryParameters,
  ModelDomain
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ExportModelDialogOptions {
  domain: ModelDomain;
}

export interface ExportModelDialogResponse {
  status: ModalDialogStatus;
  exporter?: Exporter;
  parameters?: ExportQueryParameters;
}

@Component({
  selector: 'mdm-export-model-dialog',
  templateUrl: './export-model-dialog.component.html',
  styleUrls: ['./export-model-dialog.component.scss']
})
export class ExportModelDialogComponent implements OnInit {
  exporters: Exporter[];
  formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<
      ExportModelDialogComponent,
      ExportModelDialogResponse
    >,
    @Inject(MAT_DIALOG_DATA) public data: ExportModelDialogOptions,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) {}

  get exporter() {
    return this.formGroup.get('exporter');
  }

  get asynchronous() {
    return this.formGroup.get('asynchronous');
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      exporter: new FormControl(null, Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      asynchronous: new FormControl(false)
    });

    this.resources
      .getExportableResource(this.data.domain)
      .exporters()
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'A problem occurred whilst finding available exporters.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((response: ExporterIndexResponse) => {
        this.exporters = response.body;
      });
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  continue() {
    if (this.formGroup.invalid) {
      return;
    }

    const parameters: ExportQueryParameters = this.asynchronous.value
      ? { asynchronous: true }
      : undefined;

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      exporter: this.exporter.value,
      parameters
    });
  }
}
