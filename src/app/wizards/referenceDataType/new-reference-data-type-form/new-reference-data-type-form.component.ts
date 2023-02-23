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
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  CatalogueItemDomainType,
  ReferenceDataEnumerationValueCreatePayload,
  ReferenceDataModel
} from '@maurodatamapper/mdm-resources';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface NewReferenceDataTypeState {
  valid: boolean;
  type?:
    | CatalogueItemDomainType.ReferencePrimitiveType
    | CatalogueItemDomainType.ReferenceEnumerationType;
  label?: string;
  description?: string;
  enumerationValues?: ReferenceDataEnumerationValueCreatePayload[];
}

export const referenceDataEnumerationValuesListValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const type = control.parent?.get('type');
    if (type?.value !== CatalogueItemDomainType.ReferenceEnumerationType) {
      return null;
    }

    const value = control.value;

    if (!value || !value.length) {
      return { required: true };
    }

    return null;
  };
};

@Component({
  selector: 'mdm-new-reference-data-type-form',
  templateUrl: './new-reference-data-type-form.component.html',
  styleUrls: ['./new-reference-data-type-form.component.scss']
})
export class NewReferenceDataTypeFormComponent implements OnInit, OnDestroy {
  @Input() parent?: ReferenceDataModel;

  @Output() formChange = new EventEmitter<NewReferenceDataTypeState>();

  formGroup = new FormGroup({
    type: new FormControl<
      | CatalogueItemDomainType.ReferencePrimitiveType
      | CatalogueItemDomainType.ReferenceEnumerationType
    >(null, Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
    label: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
    description: new FormControl(''),
    enumerationValues: new FormControl<
      ReferenceDataEnumerationValueCreatePayload[]
    >(null, referenceDataEnumerationValuesListValidator())
  });

  private unsubscribe$ = new Subject<void>();

  get type() {
    return this.formGroup.controls.type;
  }

  get label() {
    return this.formGroup.controls.label;
  }

  get description() {
    return this.formGroup.controls.description;
  }

  get enumerationValues() {
    return this.formGroup.controls.enumerationValues;
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((values) => {
        this.formChange.emit({
          valid: this.formGroup.valid,
          ...values
        });
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onEnumerationsListUpdate = (enumValues: any[]) => {
    this.enumerationValues.setValue(
      enumValues.map<ReferenceDataEnumerationValueCreatePayload>((val) => {
        return {
          key: val.key,
          value: val.value,
          category: val.category
        };
      })
    );
  };
}
