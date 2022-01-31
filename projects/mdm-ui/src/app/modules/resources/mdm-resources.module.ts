/*
Copyright 2020-2022 University of Oxford
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
import {  NgModule, Optional, SkipSelf } from '@angular/core';
import { MdmResourcesConfiguration } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from './mdm-resources.service';
import { MdmRestHandlerService } from './mdm-rest-handler.service';

/**
 * A wrapper Angular module for @mdm-api/resources
 */
@NgModule({
  providers: [
    MdmResourcesService,
    MdmRestHandlerService
  ]
})
export class MdmResourcesModule {
  constructor(@Optional() @SkipSelf() parentModule?: MdmResourcesModule) {
    if (parentModule) {
      throw new Error(
        'MdmResourcesModule is already loaded. Import it in the AppModule only');
    }
  }

  // Support customization of apiEndpoint
  static forRoot(config: MdmResourcesConfiguration) {
    return {
      ngModule: MdmResourcesModule,
      providers: [
        {provide: MdmResourcesConfiguration, useValue: config }
      ]
    };
  }
}
