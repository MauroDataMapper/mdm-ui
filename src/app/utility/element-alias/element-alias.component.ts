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
import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { DataClassDetail } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-element-alias',
  templateUrl: './element-alias.component.html',
  styleUrls: ['./element-alias.component.sass']
})
export class ElementAliasComponent {
  @Input() aliases: any[] = [];
  @Input() readOnly;
  @Input() property: string;
  @Input() element: DataClassDetail;
  @ViewChild('typedAliasId', { read: ViewContainerRef, static: false }) alias: ElementRef;
  typedAlias: string;

  constructor() { }


  remove(element) {
    const index = this.aliases.findIndex(alias => alias === element);
    if (index !== -1) {
      this.aliases.splice(index, 1);
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
