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
      hasBackdrop: true,
      minWidth: '600px',
      data: { validTypesToSelect, notAllowedToSelectIds }
    });
    // close: function (event, ui) {
    //   var selectedElement = jQuery(this).data("selectedElement");
    //   deferred.resolve(selectedElement);
    // },

    return dg;
  }
}
