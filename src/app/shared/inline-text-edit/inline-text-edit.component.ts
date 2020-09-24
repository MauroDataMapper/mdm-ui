/*
Copyright 2020 University of Oxford

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
import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'mdm-inline-text-edit',
  templateUrl: './inline-text-edit.component.html',
  styleUrls: ['./inline-text-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InlineTextEditComponent),
      multi: true
    }
  ]
})
export class InlineTextEditComponent implements ControlValueAccessor, OnInit {
  @Output() editableFormChanged = new EventEmitter<any>();

  @Input() inEditMode: boolean;
  @Input() readOnly = true;
  @Input() isRequired: boolean;
  @Input() styleCss: any;
  @Input() name: any;

  constructor() { }

  val: any;

  writeValue(obj: any): void {
    this.ngValue = obj;
  }

  registerOnChange(fn: any): void {
    this.propChange = fn;
  }
  registerOnTouched(fn: any): void { }
  setDisabledState?(isDisabled: boolean): void { }

  ngOnInit() {
    if (!this.inEditMode) {
      this.inEditMode = false;
    }
  }

  set ngValue(val) {
    this.val = val;
    this.propChange(val);
  }

  get ngValue() {
    return this.val;
  }

  propChange: any = () => { };
}
