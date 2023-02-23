/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  CatalogueItemDomainType,
  TermDetail,
  TerminologyDetail
} from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { HttpResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

export class CreateTermForm {
  terminology: TerminologyDetail;
  code: string;
  definition: string;
  description: string;

  constructor(terminology: TerminologyDetail) {
    this.terminology = terminology;
  }
}

@Component({
  selector: 'mdm-create-term-dialog',
  templateUrl: 'create-term-dialog.component.html',
  styleUrls: ['create-term-dialog.component.scss']
})
export class CreateTermDialogComponent implements OnInit {
  form = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    code: new FormControl('', Validators.required),
    definition: new FormControl(''),
    description: new FormControl('')
  });

  submitting = false;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private dialogRef: MatDialogRef<
      CreateTermDialogComponent,
      TermDetail | undefined
    >,
    @Inject(MAT_DIALOG_DATA) public data: CreateTermForm
  ) {}

  get code() {
    return this.form.controls.code;
  }

  get definition() {
    return this.form.controls.definition;
  }

  get description() {
    return this.form.controls.description;
  }

  ngOnInit() {
    this.form.setValue({
      code: this.data.code,
      definition: this.data.definition,
      description: this.data.description
    });
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.resources.terms
      .save(this.data.terminology.id, {
        domainType: CatalogueItemDomainType.Term,
        code: this.code.value,
        definition: this.definition.value ?? this.code.value,
        description: this.description.value
      })
      .pipe(
        catchError((error) => {
          this.messageHandler.showError('Unable to create new term', error);
          return EMPTY;
        }),
        finalize(() => (this.submitting = false))
      )
      .subscribe((response: HttpResponse<TermDetail>) => {
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
