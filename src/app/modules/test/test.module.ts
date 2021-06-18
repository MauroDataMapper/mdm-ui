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
import { HistoryComponent } from '@mdm/shared/history/history.component';
import { NgModule } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MaterialModule } from '../material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ElementTypesService } from '@mdm/services/element-types.service';
import { GridService } from '@mdm/services/grid.service';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { SharedService } from '@mdm/services/shared.service';
import { YoutrackService } from '@mdm/services/youtrack.service';
import { StateService, StateParams } from '@uirouter/core';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from '@mdm/services/message.service';
import { FormsModule } from '@angular/forms';


/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
let ResourcesServiceStub: Partial<MdmResourcesService>;
ResourcesServiceStub = {

};
let MessageServiceStub: Partial<MessageService>;
MessageServiceStub = {
};

let SecurityHandlerServiceStub: Partial<SecurityHandlerService>;
SecurityHandlerServiceStub = {
  isLoggedIn : () => true ,
  isAuthenticated: () => new Observable()
};


let StateServiceStub: Partial<StateService>;
StateServiceStub = {
  params: new StateParams({parentFolderId: '111', folder: 'test', codeSetId: 120, id: 2344, dataModelId: 234})
};

let SharedServiceStub: Partial<SharedService>;
SharedServiceStub = {
  isLoggedIn: () => true
};

@NgModule({
  declarations: [HistoryComponent, MdmPaginatorComponent],
  imports: [
    MaterialModule,
    BrowserAnimationsModule,
    HttpClientTestingModule,
    FormsModule
    ],
  providers: [
    { provide: MdmResourcesService },
    { provide: ElementTypesService },
    { provide: SharedService, useValue: SharedServiceStub },
    { provide: YoutrackService, useValue: jest.fn() },
    { provide: StateService, useValue: StateServiceStub },
    { provide: SecurityHandlerService , useValue: SecurityHandlerServiceStub},
    { provide: MessageHandlerService, useValue: jest.fn()},
    { provide: StateHandlerService, useValue: jest.fn()},
    { provide: ToastrService, useValue: jest.fn()},
    { provide: MatDialogRef, useValue: jest.fn()},
    { provide: MAT_DIALOG_DATA, useValue: jest.fn()},
    MessageService,
    GridService
],
})
export class TestModule {}
