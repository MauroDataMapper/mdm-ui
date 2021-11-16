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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { CatalogueItemDomainType, TermDetail } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { HttpResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'mdm-create-term-dialog',
  templateUrl: 'create-term-dialog.component.html',
  styleUrls: ['create-term-dialog.component.scss']
})
export class CreateTermDialogComponent implements OnInit {

  form: FormGroup;

  submitting = false;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CreateTermDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      code: [this.data.code, Validators.required],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      definition: [this.data.definition, Validators.required],
      description: [this.data.description]
    });
  }

  submit(form: FormGroup) {
    this.submitting = true;
    this.resources.terms.save(this.data.terminology.id, {
      domainType: CatalogueItemDomainType.Term,
      code: form.value.code,
      definition: form.value.definition,
      description: form.value.description
    }).pipe(
      catchError(error => {
        this.messageHandler.showError('Unable to create new term');
        console.error(error);
        return EMPTY;
      }),
      finalize(() => this.submitting = false)
    ).subscribe((response: HttpResponse<TermDetail>) => {
      if (response.ok) {
        this.dialogRef.close(response.body);
      } else {
        this.messageHandler.showWarning(response.body);
      }
      this.submitting = false;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
