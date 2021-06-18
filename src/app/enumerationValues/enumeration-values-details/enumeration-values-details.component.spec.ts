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

import { EnumerationValuesDetailsComponent } from './enumeration-values-details.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';

describe('EnumerationValuesDetailsComponent', () => {
   let component: EnumerationValuesDetailsComponent;
   let fixture: ComponentFixture<EnumerationValuesDetailsComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [
            UIRouterModule.forRoot({ useHash: true }),
            ToastrModule.forRoot()
         ],
         declarations: [
            EnumerationValuesDetailsComponent,
            ModelPathComponent,
            ElementLinkComponent

         ]
      })
         .compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(EnumerationValuesDetailsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
