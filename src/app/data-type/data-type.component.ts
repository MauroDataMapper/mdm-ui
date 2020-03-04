import { Component, OnInit } from "@angular/core";
import { StateService } from "@uirouter/core";
import { StateHandlerService } from "../services/handlers/state-handler.service";
import { Title } from "@angular/platform-browser";
import { ResourcesService } from "../services/resources.service";
import { SharedService } from "../services/shared.service";

@Component({
  selector: "app-data-type",
  templateUrl: "./data-type.component.html",
  styleUrls: ["./data-type.component.scss"]
})
export class DataTypeComponent implements OnInit {
  dataType: any;
  dataModelId: any;
  dataModel:any;
  id: any;
  tabView: any;
  activeTab: any;
  showExtraTabs: boolean;
  showEditForm = false;
  editForm = null;

  loadingData = false;

  constructor(
    private title: Title,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private resource: ResourcesService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.id = this.stateService.params.id;
    this.dataModelId = this.stateService.params.dataModelId;
    this.tabView = this.stateService.params.tabView;

    if (!this.id || !this.dataModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.title.setTitle("Data Type");
    this.dataModel = {id: this.dataModelId};
    this.loadingData = true;

    this.resource.dataType.get(this.dataModelId, this.id, null, null).subscribe(
      result => {
        const data = result.body;
        this.dataType = data;
        this.dataType.classifiers = this.dataType.classifiers || [];
        this.loadingData = false;
        this.activeTab = this.getTabDetail(this.tabView);
        this.showExtraTabs =
          !this.sharedService.isLoggedIn() || !this.dataType.editable;
      },
      error => {
        this.loadingData = false;
      }
    );
  }

  tabSelected = itemsName => {
    var tab = this.getTabDetail(itemsName);
    this.stateHandler.Go(
      "dataType",
      { tabView: itemsName },
      { notify: false, location: tab.index != 0 }
    );
    this[itemsName] = [];

    this.activeTab = this.getTabDetail(itemsName);
    if (this.activeTab && this.activeTab.fetchUrl) {
      this[this.activeTab.name] = [];
      this.loadingData = true;
      this.resource.dataType.get(this.dataModelId,  this.id,     this.activeTab.fetchUrl,  null)
        .subscribe((data) => {
          this[this.activeTab.name] = data || [];
          this.loadingData = false;
        });
    }
  };

getTabDetail = (tabName) => {
    switch (tabName) {
      case "properties":
        return { index: 0, name: "properties" };
      case "dataElements":
        return { index: 1, name: "dataElements" };
      case "comments":
        return { index: 2, name: "comments" };
      case "links":
        return { index: 3, name: "links" };
      case "attachments":
        return { index: 4, name: "attachments" };
      case "history":
        return { index: 5, name: "history", fetchUrl: null };
      default:
        return { index: 0, name: "properties" };
    }
  }

  openEditForm = (formName: any) =>{
    this.showEditForm = true;
    this.editForm = formName;
  }
}
