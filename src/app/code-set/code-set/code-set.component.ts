import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
// @ts-ignore
import { MatTabGroup } from '@angular/material';
import {CodeSetResult} from '@mdm/model/codeSetModel';
import {ResourcesService} from '@mdm/services/resources.service';
import {MessageService} from '@mdm/services/message.service';
import {SharedService} from '@mdm/services/shared.service';
import {StateService} from '@uirouter/core';
import {StateHandlerService} from '@mdm/services/handlers/state-handler.service';
import {DataModelResult} from '@mdm/model/dataModelModel';

@Component({
  selector: 'mdm-code-set',
  templateUrl: './code-set.component.html',
  styleUrls: ['./code-set.component.scss']
})
export class CodeSetComponent implements OnInit, OnDestroy {
  codeSetModel: CodeSetResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any; }; }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  dataModel4Diagram: any;
  cells: any;
  rootCell: any;

  @ViewChild('tab', {static: false}) tabGroup: MatTabGroup;
  constructor(private resourcesService: ResourcesService, private messageService: MessageService, private sharedService: SharedService, private stateService: StateService, private stateHandler: StateHandlerService) {

  }

  ngOnInit() {

    if (!this.stateService.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }



    // this.fetch();


    this.parentId = this.stateService.params.id;
    // this.resourcesService.dataModel.get(this.stateService.params.id).subscribe(x => { this.dataModel = x.body });

    window.document.title = 'Code Set';
    this.codeSetDetails(this.stateService.params.id);




    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
    this.afterSave = (result: {body: {id: any; }; }) => this.codeSetDetails(result.body.id);
  }

  codeSetDetails(id: any) {
    this.resourcesService.codeSet.get(id, null, null).subscribe((result: { body: CodeSetResult; }) => {
      this.codeSetModel = result.body;

      this.parentId = this.codeSetModel.id;
      this.showExtraTabs = !this.sharedService.isLoggedIn || (!this.codeSetModel.editable || this.codeSetModel.finalised);
      if (this.sharedService.isLoggedIn) {
        this.CodeSetPermissions(id);
      }

      this.tabGroup.realignInkBar();
      this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
      this.tabSelected(this.activeTab);
    });
  }

  CodeSetPermissions(id: any) {
    this.resourcesService.codeSet.get(id, 'permissions', null).subscribe((permissions: {body: {[x: string]: any; }; }) => {
      Object.keys(permissions.body).forEach( attrname => {
        this.codeSetModel[attrname] = permissions.body[attrname];
      });
      // Send it to message service to receive in child components
      this.messageService.FolderSendMessage(this.codeSetModel);
      this.messageService.dataChanged(this.codeSetModel);
    });
  }


  toggleShowSearch() {
    this.messageService.toggleSearch();
  }



  ngOnDestroy() {
    if (this.subscription) {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'terminology': return { index: 0, name: 'terminology' };
      case 'properties': return { index: 1, name: 'properties' };
      case 'comments': return { index: 2, name: 'comments' };
      case 'history': return { index: 3, name: 'history' };
      case 'links': return { index: 4, name: 'links' };
      case 'attachments': return { index: 5, name: 'attachments' };
      default: return { index: 0, name: 'terminology' };
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0: return { index: 0, name: 'terminology' };
      case 1: return { index: 1, name: 'properties' };
      case 2: return { index: 2, name: 'comments' };
      case 3: return { index: 3, name: 'history' };
      case 4: return { index: 4, name: 'links' };
      case 5: return { index: 5, name: 'attachments' };
      default: return { index: 0, name: 'terminology' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go('codeSet', { tabView: tab.name }, { notify: false, location: tab.index !== 0 });
    this.activeTab = tab.index;

  }

}
