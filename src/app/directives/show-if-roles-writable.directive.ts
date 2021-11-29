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
import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import { Securable, Finalisable } from '@maurodatamapper/mdm-resources';
import {SecurityHandlerService} from '../services/handlers/security-handler.service';

@Directive({
  selector: '[mdmShowIfRolesWritable]'
})
export class ShowIfRolesWritableDirective implements OnInit {
@Input() result: Securable & Finalisable;
  constructor(private securityHandler: SecurityHandlerService, private elementRef: ElementRef) {

  }
  ngOnInit(): void {
    this.watchRole(this.result);
  }
  watchRole(newValue : Securable & Finalisable) {
    const show = this.securityHandler.showIfRoleIsWritable(newValue);
    if (!show) {
      this.elementRef.nativeElement.style.display = 'none';
      return;
    }
  }

}
