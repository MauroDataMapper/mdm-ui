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
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DataClassResult } from '@mdm/model/dataClassModel';

@Component({
  selector: 'mdm-element-alias',
  templateUrl: './element-alias.component.html',
  styleUrls: ['./element-alias.component.sass']
})
export class ElementAliasComponent {
  @Input() aliases: any[] = [];
  @Input() readOnly = true;
  @Input() editableForm: any;
  @Input() property: string;
  @Input() element: DataClassResult;
  @Input() inEditMode: false;
  @ViewChild('typedAliasId', { static: false }) alias: ElementRef;
  typedAlias: string;

  constructor() { }


  remove(element) {
    const index = this.aliases.findIndex(alias => alias === element);
    if (index !== -1) {
      this.aliases.splice(index, 1);
      this.editableForm.aliases = this.aliases;
    }
  }

  add() {
    if (this.typedAlias.trim() === '') {
      return;
    }
    if (this.aliases) {
      for (const element of this.aliases) {
        if (element === this.typedAlias) {
          return;
        }
      }
    } else {
      this.aliases = [];
    }
    this.aliases.push(this.typedAlias);
    this.editableForm.aliases = this.aliases;

    this.typedAlias = '';
    this.alias.nativeElement.focus();
  }

  onKeyPress(event: any) {
    if (event.keyCode && event.keyCode === 13) {
      this.add();
      event.preventDefault();
      event.stopPropagation();
    }  
  }
}
