import { Component, OnInit } from '@angular/core';
import { ResourcesService } from "../../../services/resources.service";
import { MessageHandlerService } from "../../../services/utility/message-handler.service";

@Component({
  selector: 'app-data-model-step2',
  templateUrl: './data-model-step2.component.html',
  styleUrls: ['./data-model-step2.component.sass']
})
export class DataModelStep2Component implements OnInit {

    loadingData: any;
    defaultDataTypeProviders:any;
    dataTypes: any;
    step:any;

    constructor(private resources: ResourcesService, private messageHandler: MessageHandlerService) { }

    ngOnInit() {

        this.resources.public.get("defaultDataTypeProviders").subscribe((result) => {
            this.defaultDataTypeProviders = result.body;
        },(error) => {
            this.messageHandler.showError('There was a problem loading Data Type Providers', error);
        });

    }

    onSelectDataTypeProvider = (dataTypeProvider) => {

        if (!dataTypeProvider) {
            this.loadingData = false;
            this.dataTypes = null;
            return;
        }
        this.loadingData = true;
        this.step.scope.model.selectedDataTypeProvider = dataTypeProvider;
        this.dataTypes = { items: this.step.scope.model.selectedDataTypeProvider.dataTypes };
        this.loadingData = false;
    }

}
