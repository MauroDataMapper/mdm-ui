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
import { Component, OnInit } from '@angular/core';
import { StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';

@Component({
  selector: 'mdm-doi-redirect',
  templateUrl: './doi-redirect.component.html',
  styleUrls: ['./doi-redirect.component.scss']
})
export class DoiRedirectComponent implements OnInit {
  identifier: string;
  resolving = true;
  errorMessage: string;

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService) { }

  ngOnInit(): void {
    this.identifier = this.uiRouterGlobals.params.id;
    if (!this.identifier) {
      this.stateHandler.Go('home');
      return;
    }

    // TODO: call endpoint to resolve DOI
  }

}
