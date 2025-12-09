/*
Copyright 2020-2025 University of Oxford and NHS England

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
import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from '@env/environment';
import { UIRouterModule } from '@uirouter/angular';
import { bootstrapApplication } from '@angular/platform-browser';

import { MdmResourcesConfiguration } from '@maurodatamapper/mdm-resources';
import { MdmResourcesModule, MdmRestHandlerService } from '@mdm/modules/resources';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZxvbnServiceForPSM } from 'angular-password-strength-meter/zxcvbn';
import { pageRoutes, routerConfigFn } from '@mdm/app-routing.module';
import { UiViewComponent } from '@mdm/shared/ui-view/ui-view.component';
import { UIRouter } from '@uirouter/core';
import { userPageRoutes } from '@mdm/modules/users-routes/users-routes.module'
import { adminPageRoutes } from '@mdm/modules/admin-routes/admin-routes.module';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import 'jodit/esm/plugins/source/source.js';
import 'jodit/esm/plugins/source/editor/engines/ace.js';
import 'jodit/esm/plugins/inline-popup/inline-popup.js';

// ACE core
import 'ace-builds/src-noconflict/ace.js';

// ACE modes & themes Jodit expects
import 'ace-builds/src-noconflict/mode-html.js';
import 'ace-builds/src-noconflict/ext-searchbox.js';
import 'ace-builds/src-noconflict/theme-chrome.js';

if (environment.production) {
  enableProdMode();
  if (window) {
    window.console.log = () => {};
  }
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

bootstrapApplication(UiViewComponent, {
  providers: [
    MdmResourcesConfiguration,
    MdmRestHandlerService,
    provideAnimations(), // enables full animation support
    provideToastr(),
    provideHttpClient(),
    importProvidersFrom(
      MdmResourcesModule.forRoot({
        defaultHttpRequestOptions: { withCredentials: true },
        apiEndpoint: environment.apiEndpoint
      }),
      UIRouterModule.forRoot({
        useHash: true,
        states: [
          ...pageRoutes.states,
          ...userPageRoutes.states,
          ...adminPageRoutes.states
        ],
        config: routerConfigFn
      })
    ),
    {
      provide: 'traceRouter',
      useFactory: (router: UIRouter) => {
        router.trace.enable(1); // Shows transitions in console
      },
      deps: [UIRouter]
    },
    provideZxvbnServiceForPSM()
  ]
});
