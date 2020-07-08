import { HistoryComponent } from '@mdm/folder/history.component';
import { NgModule, LOCALE_ID } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UiViewComponent } from '@mdm/shared/ui-view/ui-view.component';
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
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RestHandlerService } from '@mdm/services/utility/rest-handler.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '@mdm/services/message.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';

class ResourcesTemplate {
  constructor(private resourcesService: MdmResourcesService) {
  }
  get = jest.fn();
  delete =jest.fn();
  post = jest.fn();
  put = jest.fn();
}

let ResourcesServiceStub: Partial<MdmResourcesService>;
ResourcesServiceStub = {

};

let MessageServiceStub: Partial<MessageService>;
MessageServiceStub ={
  getFolderPermissions: ()=>{

  }
}

let SecurityHandlerServiceStub: Partial<SecurityHandlerService>;
SecurityHandlerServiceStub = {
  isLoggedIn : () => {return true} ,
  isAuthenticated: () => {return new Observable()}
}


let StateServiceStub: Partial<StateService>;
StateServiceStub = {
  params: new StateParams({parentFolderId:"111", folder:"test", codeSetId:120, id:2344, dataModelId:234})
}

let SharedServiceStub: Partial<SharedService>;
SharedServiceStub = {
  isLoggedIn: () => {return true;}
}

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
