import { Component, OnInit, ViewChild } from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { MessageService } from '../../services/message.service';
import { SharedService } from '../../services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { DataClassResult } from '../../model/dataClassModel';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-data-class',
  templateUrl: './data-class.component.html',
  styleUrls: ['./data-class.component.sass']
})
export class DataClassComponent implements OnInit {
  dataClass: DataClassResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  parentDataClass = { id: null };
  parentDataModel = {};

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  constructor(
    private resourcesService: ResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService
  ) {}

  async ngOnInit() {
    if (!this.stateService.params.id || !this.stateService.params.dataModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.stateService.params.id && this.stateService.params.dataClassId && this.stateService.params.dataClassId.trim() != '') {
      this.parentDataClass = { id: this.stateService.params.dataClassId };
    }

    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }

    this.activeTab = this.getTabDetailByName(
      this.stateService.params.tabView
    ).index;
    // this.fetch();

    this.parentId = this.stateService.params.id;
    // this.resourcesService.dataModel.get(this.stateService.params.id).subscribe(x => { this.dataModel = x.body });

    // if(this.stateService.params.edit === "true"){ //Call this if using message service.
    //     // this.editMode = true;
    //     this.messageService.showEditMode(true);
    // }
    // else
    //     this.messageService.showEditMode(false);
    window.document.title = 'Data Class';
    this.dataClassDetails(
      this.stateService.params.dataModelId,
      this.parentDataClass.id,
      this.stateService.params.id
    );
    // this.subscription = this.messageService.changeUserGroupAccess.subscribe((message: boolean) => {
    //   this.showSecuritySection = message;
    // });
    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
    this.afterSave = (result: { body: { id: any } }) =>
      this.dataClassDetails(
        this.stateService.params.dataModelId,
        this.parentDataClass.id,
        result.body.id
      );
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'content':
        return { index: 0, name: 'content' };
      // case 'dataClasses':  return {index:0, name:'dataClasses'};
      // case 'dataElements': return {index:1, name:'dataElements'};
      case 'properties':
        return { index: 1, name: 'properties' };
      case 'comments':
        return { index: 2, name: 'comments' };
      case 'links':
        return { index: 3, name: 'links' };
      case 'summaryMetadata':
        return { index: 4, name: 'summaryMetadata' };
      case 'attachments':
        return { index: 5, name: 'attachments' };
      // case 'history': 	 return {index:4, name:'history'     , fetchUrl:null};
      // default: 			 return {index:0, name:'dataClasses', fetchUrl:'dataClasses'};
      default:
        return { index: 0, name: 'content' };
    }
  }

  dataClassDetails(dataModelId: any, parentDataClassId, id) {
    this.resourcesService.dataClass
      .get(dataModelId, parentDataClassId, id, null, null)
      .subscribe((result: { body: DataClassResult }) => {
        this.dataClass = result.body;
        this.dataClass.parentDataModel = dataModelId;
        this.dataClass.parentDataClass = parentDataClassId;
        this.parentDataModel = {
          id: dataModelId,
          editable: this.dataClass.editable,
          finalised: this.dataClass.breadcrumbs[0].finalised
        };
        this.messageService.FolderSendMessage(this.dataClass);
        this.messageService.dataChanged(this.dataClass);

        if (this.dataClass) {
          this.tabGroup.realignInkBar();
          this.activeTab = this.getTabDetailByName(
            this.stateService.params.tabView
          ).index;
          this.tabSelected(this.activeTab);
        }
      });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'dataClasses' };
      case 1:
        return { index: 1, name: 'types' };
      case 2:
        return { index: 2, name: 'properties' };
      case 3:
        return { index: 3, name: 'summaryMetadata' };
      case 4:
        return { index: 4, name: 'comments' };
      case 5:
        return { index: 5, name: 'history' };
      case 6:
        return { index: 6, name: 'diagram' };
      case 7:
        return { index: 7, name: 'links' };
      case 8:
        return { index: 8, name: 'attachments' };
      default:
        return { index: 0, name: 'dataClasses' };
    }
  }
  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'dataClass',
      { tabView: tab.name },
      { notify: false, location: tab.index != 0 }
    );
    this.activeTab = tab.index;
  }
}
