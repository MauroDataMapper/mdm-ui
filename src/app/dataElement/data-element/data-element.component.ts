import { Component, OnInit, ViewChild } from '@angular/core';
import { ResourcesService } from '@mdm/services/resources.service';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { DataElementResult } from '@mdm/model/dataElementModel';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'mdm-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.sass']
})
export class DataElementComponent implements OnInit {
  dataElement: DataElementResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  dataClass = { id: null };
  dataModel = { id: null };

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  constructor(
    private resourcesService: ResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService
  ) {
    if (
      !this.stateService.params.id ||
      !this.stateService.params.dataModelId ||
      !this.stateService.params.dataClassId
    ) {
      this.stateHandler.NotFound({ location: false });
      return;
    }
    if (
      this.stateService.params.id &&
      this.stateService.params.dataModelId &&
      this.stateService.params.dataModelId.trim() !== ''
    ) {
      this.dataModel = { id: this.stateService.params.dataModelId };
    }

    if (
      this.stateService.params.id &&
      this.stateService.params.dataClassId &&
      this.stateService.params.dataClassId.trim() !== ''
    ) {
      this.dataClass = { id: this.stateService.params.dataClassId };
    }

    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }
  }

   ngOnInit() {
    this.activeTab = this.getTabDetailByName(
      this.stateService.params.tabView
    ).index;

    this.showExtraTabs =
       this.sharedService.isLoggedIn() ;
    /// this.parentId = this.stateService.params.id;
    // this.resourcesService.dataModel.get(this.stateService.params.id).subscribe(x => { this.dataModel = x.body });

    // if(this.stateService.params.edit === "true"){ //Call this if using message service.
    //     // this.editMode = true;
    //     this.messageService.showEditMode(true);
    // }
    // else
    //     this.messageService.showEditMode(false);
    window.document.title = 'Data Element';
    this.dataElementDetails(
      this.stateService.params.dataModelId,
      this.dataClass.id,
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
      this.dataElementDetails(
        this.stateService.params.dataModelId,
        this.dataClass.id,
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

  dataElementDetails(dataModelId: any, dataClassId, id) {
    this.resourcesService.dataElement
      .get(dataModelId, dataClassId, id, null, null)
      .subscribe((result: { body: DataElementResult }) => {
        this.dataElement = result.body;
        // this.dataClass.parentDataModel = dataModelId;
        // this.dataClass.parentDataClass = parentDataClassId;
        // this.parentDataModel = {
        //   id: dataModelId,
        //   editable: this.dataClass.editable,
        //   finalised: this.dataClass.breadcrumbs[0].finalised
        // };
        this.messageService.FolderSendMessage(this.dataElement);
        this.messageService.dataChanged(this.dataElement);

        if (this.dataElement) {
          // this.tabGroup.realignInkBar();
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
        return { index: 0, name: 'properties' };
      case 1:
        return { index: 1, name: 'comments' };
      case 2:
        return { index: 2, name: 'links' };
      case 3:
        return { index: 3, name: 'summaryMetadata' };
      case 4:
        return { index: 4, name: 'attachments' };
      default:
        return { index: 0, name: 'properties' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'dataElement',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this.activeTab = tab.index;
  }
}
