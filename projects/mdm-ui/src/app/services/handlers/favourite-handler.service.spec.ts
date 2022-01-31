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
import { TestBed } from '@angular/core/testing';
import { FavouriteHandlerService } from './favourite-handler.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';

describe('FavouriteHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      NgxSkeletonLoaderModule,
      MatTooltipModule,
      UIRouterModule.forRoot({ useHash: true }),
      ToastrModule.forRoot()
    ],
    providers: [
      {
        provide: MdmResourcesService, useValue: {}
      }
    ],
    declarations: [
      ProfilePictureComponent,
      ByteArrayToBase64Pipe
    ]
  }));

  it('should be created', () => {
    const service: FavouriteHandlerService = TestBed.inject(
      FavouriteHandlerService
    );
    expect(service).toBeTruthy();
  });
});
