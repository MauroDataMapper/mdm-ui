import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ROLES {
  constructor() {}

  map = {
    ADMINISTRATOR: 'Administrator',
    EDITOR: 'Editor',
    PENDING: 'Pending'
  };
  array = [
    { value: 'ADMINISTRATOR', text: 'Administrator' },
    { value: 'EDITOR', text: 'Editor' },
    { value: 'PENDING', text: 'Pending' }
  ];
  notPendingArray = [
    { value: 'ADMINISTRATOR', text: 'Administrator' },
    { value: 'EDITOR', text: 'Editor' }
  ];
}
