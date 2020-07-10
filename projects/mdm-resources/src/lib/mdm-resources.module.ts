import { NgModule, Optional, ModuleWithProviders, SkipSelf } from '@angular/core';
import { MdmRestHandlerService } from './mdm-rest-handler.service';
import { MdmResourcesService } from './mdm-resources.service';
import { MdmResourcesConfiguration } from '@maurodatamapper/mdm-resources';
import { HttpClientModule, HttpClient } from '@angular/common/http';


/**
 * A wrapper Angular module for @mdm-api/resources
 */
@NgModule({
  imports:[HttpClientModule],
  providers: [
    MdmResourcesService,
    MdmRestHandlerService,
    HttpClient
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
  static forRoot(config: MdmResourcesConfiguration): ModuleWithProviders {
    return {
      ngModule: MdmResourcesModule,
      providers: [
        {provide: MdmResourcesConfiguration, useValue: config }
      ]
    };
  }
}
