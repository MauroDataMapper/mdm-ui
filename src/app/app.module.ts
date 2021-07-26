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
import { APP_BASE_HREF, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from '@env/environment';
import { UIRouterModule } from '@uirouter/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ROLES } from './constants/roles';
import { ModalModule } from './modals/modal.module';
import { AdminModule } from './modules/admin/admin.module';
import { CatalogueModule } from './modules/catalogue/catalogue.module';
import { MdmResourcesModule } from './modules/resources/mdm-resources.module';
import { SharedModule } from './modules/shared/shared.module';
import { UsersModule } from './modules/users/users.module';
import { SharedService } from './services/shared.service';
import { UiViewComponent } from './shared/ui-view/ui-view.component';
import '@mdm/utility/extensions/mat-dialog.extensions';
import { HttpRequestProgressInterceptor } from './services/http-request-progress.interceptor';
import { MergeDiffModule } from './merge-diff/merge-diff.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CatalogueModule,
    AdminModule,
    UsersModule,
    SharedModule,
    AppRoutingModule,
    ModalModule,
    UIRouterModule.forRoot({ useHash: true }),
    HttpClientModule,
    MdmResourcesModule.forRoot({
      defaultHttpRequestOptions: { withCredentials: true },
      apiEndpoint: environment.apiEndpoint
    }),
    MergeDiffModule
  ],
  providers: [
    { provide: MAT_TABS_CONFIG, useValue: { animationDuration: '0ms' } },
    { provide: ROLES, useClass: ROLES },
    { provide: LOCALE_ID, useValue: 'en-GB' },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, autoFocus: false } },
    { provide: HTTP_INTERCEPTORS, useClass: HttpRequestProgressInterceptor, multi: true }
  ],
  bootstrap: [UiViewComponent]
})
export class AppModule {
  latestError: any;

  constructor(private sharedService: SharedService) {
    this.sharedService.handleExpiredSession(true);
  }
}
