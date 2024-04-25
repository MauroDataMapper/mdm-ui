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
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ROLES {
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
  constructor() {}
}
