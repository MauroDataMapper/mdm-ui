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
import { UIRouter } from '@uirouter/angular';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StateHandlerService {
  handler: Handler =
    {
      states: {
        home: 'appContainer.mainApp.home',
        alldatamodel: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel',
        datamodel: 'appContainer.mainApp.twoSidePanel.catalogue.dataModel',
        codeset: 'appContainer.mainApp.twoSidePanel.catalogue.codeSet',
        dataclass: 'appContainer.mainApp.twoSidePanel.catalogue.dataClass',
        datatype: 'appContainer.mainApp.twoSidePanel.catalogue.dataType',
        dataelement: 'appContainer.mainApp.twoSidePanel.catalogue.dataElement',
        folder: 'appContainer.mainApp.twoSidePanel.catalogue.folder',
        classification: 'appContainer.mainApp.twoSidePanel.catalogue.classification',
        diagram: 'appContainer.mainApp.diagram',

        terminology: 'appContainer.mainApp.twoSidePanel.catalogue.terminology',
        term: 'appContainer.mainApp.twoSidePanel.catalogue.term',

        newcodeset: 'appContainer.mainApp.twoSidePanel.catalogue.NewCodeSet',
        newdatamodel: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataModel',
        newdataclass: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataClass',
        newdataelement: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataElement',
        newdatatype: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataType',
        newclassification: 'appContainer.mainApp.twoSidePanel.catalogue.NewClassifier',
        newversiondatamodel: 'appContainer.mainApp.twoSidePanel.catalogue.newVersionDataModel',
        newversionterminology: 'appContainer.mainApp.twoSidePanel.catalogue.newVersionTerminology',
        newversioncodeset: 'appContainer.mainApp.twoSidePanel.catalogue.newVersionCodeSet',

        'admin.user': 'appContainer.adminArea.user',
        'admin.users': 'appContainer.adminArea.users',

        'userarea.profile': 'menuTwoSidePanel.userArea.profile',

        'admin.group': 'appContainer.adminArea.group',
        'admin.groups': 'appContainer.adminArea.groups',
        dataflowtransformation: 'appContainer.mainApp.dataFlowTransformation',
        dataflowdm2dm: 'appContainer.mainApp.dataFlowDM2DM',
        dataflowchain: 'appContainer.mainApp.dataFlowChain',
        modelscomparison: 'appContainer.mainApp.modelsComparison',
        linksuggestion: 'appContainer.mainApp.linkSuggestion',
                export: 'appContainer.mainApp.twoSidePanel.catalogue.export',
        import: 'appContainer.mainApp.twoSidePanel.catalogue.import',

        simpleviewhome: 'appContainer.simpleApp.home',
        simpleviewresult: 'appContainer.simpleApp.result',
        simpleviewelement: 'appContainer.simpleApp.element',
        about: 'appContainer.mainApp.about'
      }
    };
  constructor(private router: UIRouter, private ngToast: ToastrService, private location: Location) { }

  handleSimpleView(name, params) {
    // tslint:disable-next-line: deprecation
    if ((params && params.mode === 'advancedView') || (['appContainer.simpleApp.result', 'appContainer.simpleApp.element'].indexOf(this.router.stateService.current.toString()) === -1)) {
      return name;
    }

    let state = name;
    const needsRedirect = [
      'appContainer.mainapp.twoSidePanel.catalogue.folder', 'folder',
      'appContainer.mainapp.twoSidePanel.catalogue.datamodel', 'datamodel',
      'appContainer.mainapp.twoSidePanel.catalogue.dataclass', 'dataclass',
      'appContainer.mainapp.twoSidePanel.catalogue.dataelement', 'dataelement',
      'appContainer.mainapp.twoSidePanel.catalogue.terminology', 'terminology',
      'appContainer.mainapp.twoSidePanel.catalogue.term', 'term',
      'appContainer.mainapp.twoSidePanel.catalogue.datatype', 'datatype',
      'appContainer.mainapp.twoSidePanel.catalogue.classification', 'classification',
    ];


    const index = needsRedirect.findIndex((item) => {
      return item.toLowerCase() === name.toLowerCase();
    });

    if (index !== -1) {
      state = 'appContainer.simpleApp.element';
      // if this is going to be redirected to simpleViewElement, do not transmit pagination settings of the current page
      params.criteria = null;
      params.pageIndex = null;
      params.pageSize = null;
      params.offset = null;
    }
    return state;
  }


  getStateName(name, params = {}) {
    let state = name;
    if (this.handler.states[name.toLowerCase().trim()]) {
      state = this.handler.states[name.toLowerCase().trim()];
    }

    state = this.handleSimpleView(state, params);

    return state;
  }


  getURL(name, params = {}): string {
    const state = this.getStateName(name, params);
    // return $state.href(state, params, { absolute: false });
    return this.router.stateService.href(state, params, { absolute: false });

  }

  Go(name, params = {}, option = null) {
    const state = this.getStateName(name, params);
    return this.router.stateService.go(state, params, option);
  }

  reload() {
    this.router.stateService.reload();
  }

  ApplicationOffline() {
    // messageHandler should show a proper message on the main pag
    this.ngToast.warning('Application is offline!');

  }
  ConnectionError() {
    this.ngToast.warning('Server connection failed');
  }

  ServerError(option = null) {
    return this.router.stateService.go('appContainer.mainApp.twoSidePanel.catalogue.serverError', {}, option);

  }
  NotImplemented(option = null) {
    return this.router.stateService.go('appContainer.mainApp.twoSidePanel.catalogue.notImplemented', {}, option);

  }
  NotAuthorized(option = null) {
    return this.router.stateService.go('appContainer.mainApp.twoSidePanel.catalogue.notAuthorized', {}, option);

  }
  NotFound(option = null) {
    return this.router.stateService.go('appContainer.mainApp.twoSidePanel.catalogue.notFound', {}, option);

  }

  GoPrevious() {
    this.location.back();
  }

  NewWindow(name, params = {}, windowsOptions = null) {
    const url = this.router.stateService.href(this.getStateName(name, params), params);
    window.open(url, '_blank', windowsOptions);
  }

  CurrentWindow(url) {
    window.location.href = url;
  }

}


class Handler {

  states: any;

}
