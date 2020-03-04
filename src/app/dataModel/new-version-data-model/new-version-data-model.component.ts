import { Component, OnInit } from '@angular/core';
import {StateService} from "@uirouter/core";
import {StateHandlerService} from "../../services/handlers/state-handler.service";
import {ResourcesService} from "../../services/resources.service";
import {ValidatorService} from "../../services/validator.service";
import {MessageHandlerService} from "../../services/utility/message-handler.service";


@Component({
  selector: 'app-new-version-data-model',
  templateUrl: './new-version-data-model.component.html',
  styleUrls: ['./new-version-data-model.component.sass']
})
export class NewVersionDataModelComponent implements OnInit {
  step = 1;
  dataModel: any;
  errors:any;
  versionType: any;
  processing:any;
  form = {
    label: "",
    copyPermissions: false,
    copyDataFlows: false,

    moveDataFlows: false
  };
  constructor(private stateService: StateService, private stateHandler: StateHandlerService, private resources: ResourcesService, private validator: ValidatorService, private messageHandler : MessageHandlerService) {
    window.document.title = "New Version";
  }
  ngOnInit() {
    if (!this.stateService.params.dataModelId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.resources.dataModel.get(this.stateService.params.dataModelId).subscribe(response =>{
      this.dataModel =  response.body;
    });
  }


versionTypeChecked () {
  this.step++;
};

validate() {
  this.errors = null;

  if(!this.versionType){
    return false;
  }

  if(this.versionType === "newElementVersion") {
    if(this.validator.isEmpty(this.form.label)){
      this.errors = this.errors || {};
      this.errors.label = "Name can not be empty!";
    }else if (this.form.label.trim().toLowerCase() ===  this.dataModel.label.trim().toLowerCase()){
      this.errors = this.errors || {};
      this.errors.label = "The name should be different from the current version name '" + this.dataModel.label + "'"
    }
  }
  return !this.errors;
};

save  () {
  if(!this.validate()){
    return;
  }
  //newElementVersion
  //newDocumentVersion
  if(this.versionType === "newElementVersion"){
    var resource = {
      label: this.form.label,
      copyPermissions : this.form.copyPermissions,
      copyDataFlows: this.form.copyDataFlows
    };
    this.processing = true;
    this.resources.dataModel.put(this.dataModel.id, "newVersion", {resource:resource})
        .subscribe(response => {
          this.processing = false;
          this.messageHandler.showSuccess('New Data Model version created successfully.');
          this.stateHandler.Go("datamodel", {id: response.body.id}, {reload:true});
        }, error => {
      this.processing = false;
      this.messageHandler.showError('There was a problem creating the new Data Model version.', error);
    });
  }else if(this.versionType === "newDocumentVersion"){
    var resources = {
      moveDataFlows: this.form.moveDataFlows
    };
    this.processing = true;
    this.resources.dataModel.put(this.dataModel.id, "newDocumentationVersion", {resource:resources})
        .subscribe(response => {
          this.processing = false;
          this.messageHandler.showSuccess('New Document Model version created successfully.');
          this.stateHandler.Go("datamodel", {id: response.body.id}, {reload:true});
        },error => {
      this.processing = false;
      this.messageHandler.showError('There was a problem creating the new Document Model version.', error);
    });
  }
};

cancel = function () {
  this.stateHandler.Go("datamodel", {id:  this.dataModel.id});
};



}
