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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiKeysComponent } from './api-keys.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { empty } from 'rxjs';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import '@mdm/utility/extensions/mat-dialog.extensions';

describe('ApiKeysComponent', () => {
   let component: ApiKeysComponent;
   let fixture: ComponentFixture<ApiKeysComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [
            MatDialogModule,
            MatTableModule,
            UIRouterModule.forRoot({ useHash: true }),
            ToastrModule.forRoot()
         ],
         providers: [
            {
               provide: MdmResourcesService,
               useValue: {
                  catalogueUser: {
                     // tslint:disable-next-line: deprecation
                     listApiKeys: () => empty(),
                     // tslint:disable-next-line: deprecation
                     enableApiKey: () => empty(),
                     // tslint:disable-next-line: deprecation
                     disableApiKey: () => empty(),
                     // tslint:disable-next-line: deprecation
                     refreshApiKey: () => empty(),
                     // tslint:disable-next-line: deprecation
                     saveApiKey: () => empty(),
                     // tslint:disable-next-line: deprecation
                     removeApiKey: () => empty(),
                  }
               }
            }
         ],
         declarations: [ApiKeysComponent]
      }).compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(ApiKeysComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
