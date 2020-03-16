import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs';
import { ResourcesService } from '../services/resources.service';
import { MessageService } from '../services/message.service';
import { SharedService } from '../services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';
import { DataModelResult } from '../model/dataModelModel';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'mdm-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.scss']
})
export class DataModelComponent implements OnInit, OnDestroy {
  dataModel: DataModelResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  dataModel4Diagram: any;
  cells: any;
  rootCell: any;

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  constructor(
    private resourcesService: ResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService
  ) {}

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

    window.document.title = 'Data Model';
    this.dataModelDetails(this.stateService.params.id);

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
    this.afterSave = (result: { body: { id: any } }) =>
      this.dataModelDetails(result.body.id);
  }

  dataModelDetails(id: any) {
    this.resourcesService.dataModel
      .get(id, null, null)
      .subscribe((result: { body: DataModelResult }) => {
        this.dataModel = result.body;

        this.parentId = this.dataModel.id;
        this.showExtraTabs =
          !this.sharedService.isLoggedIn ||
          !this.dataModel.editable || this.dataModel.finalised;
        if (this.sharedService.isLoggedIn) {
          this.DataModelPermissions(id);
        }

        this.tabGroup.realignInkBar();
        this.activeTab = this.getTabDetailByName(
          this.stateService.params.tabView
        ).index;
        this.tabSelected(this.activeTab);
      });
  }

  DataModelPermissions(id: any) {
    this.resourcesService.dataModel
      .get(id, 'permissions', null)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
        permissions.body.forEach( attrname => {
          this.dataModel[attrname] = permissions.body[attrname];
        });
        // Send it to message service to receive in child components
        this.messageService.FolderSendMessage(this.dataModel);
        this.messageService.dataChanged(this.dataModel);
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
      case 'dataClasses':
        return { index: 0, name: 'dataClasses' };
      case 'types':
        return { index: 1, name: 'types' };
      case 'properties':
        return { index: 2, name: 'properties' };
      case 'summaryMetadata':
        return { index: 3, name: 'summaryMetadata' };
      case 'comments':
        return { index: 4, name: 'comments' };
      case 'history':
        return { index: 5, name: 'history' };
      case 'diagram':
        return { index: 6, name: 'diagram' };
      case 'links':
        return { index: 7, name: 'links' };
      case 'attachments':
        return { index: 8, name: 'attachments' };
      case 'dataflow': {
        if (this.dataModel.type === 'Data Asset') {
          return { index: 9, name: 'dataflow' };
        }
        return { index: 0, name: 'dataClasses' };
      }
      default:
        return { index: 0, name: 'dataClasses' };
    }
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
      case 9: {
        if (this.dataModel.type === 'Data Asset') {
          return { index: 9, name: 'dataflow' };
        }
        return { index: 0, name: 'dataClasses' };
      }
      default:
        return { index: 0, name: 'dataClasses' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go('dataModel', { tabView: tab.name }, { notify: false, location: tab.index !== 0 } );
    this.activeTab = tab.index;

    if (tab.name === 'diagram') {
      // this.dataModel4Diagram = null;
      // this.cells = null;
      // this.rootCell = null;

      // this.resourcesService.dataModel.get(this.dataModel.id, "hierarchy", {}).toPromise().then((data) => {
      //     this.dataModel4Diagram = data.body;
      //     var result = this.jointDiagram3Service.DrawDataModel(data.body);
      //     this.cells = result.cells;
      //     this.rootCell = result.rootCell;
      // });
      return;
    }
  }
}
