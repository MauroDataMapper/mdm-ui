import { Injectable } from '@angular/core';

/**
 * Service to manage global editing state of the application.
 * 
 * Used to manage/cancel transitions to other parts of the application if there is the potential to lose unsaved changes.
 */
@Injectable({
  providedIn: 'root'
})
export class EditingService {

  private _isEditing: boolean = false;

  get isEditing() {
    return this._isEditing;
  }

  set isEditing(val: boolean) {
    this._isEditing = val;
  }

  constructor() { }
}
