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
import { ModelSelectorTreeComponent } from './model-selector-tree.component';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { FormsModule } from '@angular/forms';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SecurityHandlerService } from '@mdm/services';
import { empty } from 'rxjs';
import { ContainerDomainType } from '@maurodatamapper/mdm-resources';

interface SecurityHandlerServiceStub {
  isLoggedIn: jest.Mock;
}

describe('ModelSelectorTreeComponent', () => {
  let component: ModelSelectorTreeComponent;
  let fixture: ComponentFixture<ModelSelectorTreeComponent>;

  let treeSpy: any;

  const securityHandler: SecurityHandlerServiceStub = {
    isLoggedIn: jest.fn(() => false)
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxSkeletonLoaderModule,
        FormsModule,
        FoldersTreeModule,
        MatTooltipModule,
        UIRouterModule.forRoot({ useHash: true }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: MdmResourcesService,
          useValue: {
            tree: {
              // tslint:disable-next-line: deprecation
              list: () => empty(),
              // tslint:disable-next-line: deprecation
              get: () => empty()
            }
          }
        },
        {
          provide: SecurityHandlerService,
          useValue: securityHandler
        },
        ElementTypesService
      ],
      declarations: [
        ByteArrayToBase64Pipe,
        ProfilePictureComponent,
        ModelSelectorTreeComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelSelectorTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    treeSpy =  jest.spyOn(component['resources'].tree, 'list');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('load tree with filter applied', () => {
    const defaultQueryStringParams: any = {
      includeDocumentSuperseded: true,
      includeModelSuperseded: true,
      includeDeleted: true
    };
    component.reload();
    expect(treeSpy).toHaveBeenCalledWith(ContainerDomainType.Folders, defaultQueryStringParams);
  });
});
