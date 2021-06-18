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

import { DataClassesListComponent } from './data-classes-list.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { MoreDescriptionComponent } from '../more-description/more-description.component';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { ElementDataTypeComponent } from '../element-data-type/element-data-type.component';
import { AllLinksInPagedListComponent } from '@mdm/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { MultiplicityComponent } from '../multiplicity/multiplicity.component';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';

describe('DataClassesListComponent', () => {
   let component: DataClassesListComponent;
   let fixture: ComponentFixture<DataClassesListComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [
            NgxSkeletonLoaderModule,
            MatTooltipModule,
            MatMenuModule,
            MatDividerModule,
            MatCheckboxModule,
            MatTableModule,
            MatCheckboxModule,
            MatDialogModule,
            NoopAnimationsModule,
            MatInputModule,
            MatFormFieldModule,
            MatSortModule,
            MatPaginatorModule,
            FormsModule,
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
            ElementLinkComponent,
            MoreDescriptionComponent,
            McPagedListComponent,
            ElementDataTypeComponent,
            AllLinksInPagedListComponent,
            MdmPaginatorComponent,
            MultiplicityComponent,
            ByteArrayToBase64Pipe,
            DataClassesListComponent
         ]
      })
         .compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(DataClassesListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
