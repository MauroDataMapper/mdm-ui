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
import { SecurityHandlerService } from '../handlers/security-handler.service';

@Injectable({
  providedIn: 'root',
})
export class StateRoleAccessService {
  constructor(private securityHandler: SecurityHandlerService) {}

  hasAccess = (state) => {
    const allowedStates = [
        'appContainer.mainApp',
        'appContainer.mainApp.default',
        'appContainer.mainApp.register',
        'appContainer.mainApp.resetPassword',
        'appContainer.mainApp.about',
        'appContainer.mainApp.twoSidePanel',
        'appContainer.mainApp.twoSidePanel.catalogue',
        'appContainer.mainApp.twoSidePanel.catalogue.allDataModel',
        'appContainer.mainApp.home',
        'appContainer.mainApp.twoSidePanel.catalogue.dataType',
        'appContainer.mainApp.twoSidePanel.catalogue.dataModel',
        'appContainer.mainApp.twoSidePanel.catalogue.codeSet',
        'appContainer.mainApp.twoSidePanel.catalogue.terminology',
        'appContainer.mainApp.twoSidePanel.catalogue.term',
        'appContainer.mainApp.twoSidePanel.catalogue.dataElement',
        'appContainer.mainApp.twoSidePanel.catalogue.dataClass',
        'appContainer.mainApp.twoSidePanel.catalogue.selection',
        'appContainer.mainApp.twoSidePanel.catalogue.classification',
        'appContainer.mainApp.twoSidePanel.catalogue.resourceNotFound',
        'appContainer.mainApp.twoSidePanel.catalogue.serverError',
        'appContainer.mainApp.twoSidePanel.catalogue.notImplemented',
        'appContainer.mainApp.twoSidePanel.catalogue.notAuthorized',
        'appContainer.mainApp.twoSidePanel.catalogue.notFound',
        'appContainer.mainApp.twoSidePanel.catalogue.search',
        'appContainer.mainApp.twoSidePanel.catalogue.folder',
        'otherwise'
    ];

    if (state) {
      state = state.toLowerCase();
    }
    // if it is a public resource, then show it, regardless of the user role
    if (allowedStates.findIndex(x => x.toLowerCase() === state) > -1) {
      return true;
    }

    // if it is NOT a public resource, then check if user has enough access

    /// / if the user is not logged in then return false
    if (!this.securityHandler.isLoggedIn()) {
      return false;
    }

    /// /// if this user is logged In but its role does NOT exist in valid role for this resource
    if (this.securityHandler.isLoggedIn()) {
      return true;
    }

    return false;
  };
}
