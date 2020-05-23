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
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ElementSelectorComponent } from '../utility/element-selector.component';
import { MatDialog, DialogPosition } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class ElementSelectorDialogueService {
  constructor(public dialog: MatDialog, private sanitizer: DomSanitizer) {}

  open(
    validTypesToSelect,
    notAllowedToSelectIds,
    name: string,
    position: DialogPosition
  ) {
    if (!validTypesToSelect || (validTypesToSelect && validTypesToSelect.length === 0)) {
      validTypesToSelect = [
        'Folder',
        'DataModel',
        'DataClass',
        'DataType',
        'DataElement',
        'Term'
      ];
    }

    const dg = this.dialog.open(ElementSelectorComponent, {
      data: { validTypesToSelect, notAllowedToSelectIds },
      panelClass: 'element-selector-modal'
    });
    // close: function (event, ui) {
    //   var selectedElement = jQuery(this).data("selectedElement");
    //   deferred.resolve(selectedElement);
    // },

    return dg;
  }
}
