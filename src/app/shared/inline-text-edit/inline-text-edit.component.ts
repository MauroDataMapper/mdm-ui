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
import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'mdm-inline-text-edit',
  templateUrl: './inline-text-edit.component.html',
  styleUrls: ['./inline-text-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      useExisting: forwardRef(() => InlineTextEditComponent),
      multi: true
    }
  ]
})
export class InlineTextEditComponent implements ControlValueAccessor, OnInit {
  @Output() saveClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();

  @Input() inEditMode: boolean;
  @Input() readOnly = true;
  @Input() isRequired: boolean;
  @Input() styleCss: string;
  @Input() name: string;
  @Input() showButtons = false;

  val: any;
  constructor() { }

  get ngValue() {
    return this.val;
  }

  set ngValue(val) {
    this.val = val;
    this.propChange(val);
  }

  writeValue(obj: any): void {
    this.ngValue = obj;
  }

  registerOnChange(fn: any): void {
    this.propChange = fn;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerOnTouched(fn: any): void { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setDisabledState?(isDisabled: boolean): void { }

  ngOnInit() {
    if (!this.inEditMode) {
      this.inEditMode = false;
    }
  }



  save()
  {
    this.saveClicked.emit();
  }

  cancel()
  {
    this.cancelClicked.emit();
  }

  propChange: any = () => { };
}
