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
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  TerminologyDetail,
  TermRelationshipType,
  TermRelationshipTypeDetail,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { HttpResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

export class CreateTermRelationshipTypeForm {
  id?: Uuid;
  label: string;
  displayLabel: string;
  parentalRelationship = false;
  childRelationship = false;

  constructor(
    readonly terminology: TerminologyDetail,
    relationshipType?: TermRelationshipType
  ) {
    if (relationshipType) {
      this.id = relationshipType.id || null;
      this.label = relationshipType.label;
      this.displayLabel = relationshipType.displayLabel;
      this.parentalRelationship =
        relationshipType.parentalRelationship || false;
      this.childRelationship = relationshipType.childRelationship || false;
    }
  }
}

@Component({
  selector: 'mdm-create-term-relationship-type-dialog',
  templateUrl: 'create-term-relationship-type-dialog.component.html',
  styleUrls: ['create-term-relationship-type-dialog.component.scss']
})
export class CreateTermRelationshipTypeDialogComponent implements OnInit {
  form = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    label: new FormControl('', Validators.required),
    displayLabel: new FormControl(''),
    parentalRelationship: new FormControl(false),
    childRelationship: new FormControl(false)
  });

  submitting = false;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private dialogRef: MatDialogRef<CreateTermRelationshipTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateTermRelationshipTypeForm
  ) {}

  ngOnInit() {
    this.form.setValue({
      label: this.data.label,
      displayLabel: this.data.displayLabel,
      parentalRelationship: this.data.parentalRelationship,
      childRelationship: this.data.childRelationship
    });
  }

  submit() {
    if (this.form.invalid) {
      this.messageHandler.showError('Form invalid');
    }

    this.submitting = true;
    if (this.data.id) {
      this.resources.termRelationshipTypes
        .update(this.data.terminology.id, this.data.id, {
          label: this.form.value.label,
          displayLabel: this.form.value.displayLabel,
          parentalRelationship: this.form.value.parentalRelationship || false,
          childRelationship: this.form.value.childRelationship || false
        })
        .pipe(
          catchError((error) => {
            this.messageHandler.showError(
              'Unable to create update relationship type'
            );
            console.error(error);
            return EMPTY;
          }),
          finalize(() => (this.submitting = false))
        )
        .subscribe((response: HttpResponse<TermRelationshipTypeDetail>) => {
          if (response.ok) {
            this.dialogRef.close(response.body);
          } else {
            this.messageHandler.showWarning(response.body);
          }
        });
    } else {
      this.resources.termRelationshipTypes
        .save(this.data.terminology.id, {
          label: this.form.value.label,
          displayLabel: this.form.value.displayLabel,
          parentalRelationship: this.form.value.parentalRelationship || false,
          childRelationship: this.form.value.childRelationship || false
        })
        .pipe(
          catchError((error) => {
            this.messageHandler.showError(
              'Unable to create new relationship type'
            );
            console.error(error);
            return EMPTY;
          }),
          finalize(() => (this.submitting = false))
        )
        .subscribe((response: HttpResponse<TermRelationshipTypeDetail>) => {
          if (response.ok) {
            this.dialogRef.close(response.body);
          } else {
            this.messageHandler.showWarning(response.body);
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
