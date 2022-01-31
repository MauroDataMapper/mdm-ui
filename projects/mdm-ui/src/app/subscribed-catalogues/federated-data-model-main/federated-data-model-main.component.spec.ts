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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { SubscribedCataloguesService } from '../subscribed-catalogues.service';

import { FederatedDataModelMainComponent } from './federated-data-model-main.component';

describe('FederatedDataModelMainComponent', () => {
  let component: FederatedDataModelMainComponent;
  let fixture: ComponentFixture<FederatedDataModelMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: { }
        },
        {
          provide: SubscribedCataloguesService,
          useValue: {
            getFederatedDataModels: (_: string) => {
              return of();
            }
          }
        }
      ],
      declarations: [ FederatedDataModelMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FederatedDataModelMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
