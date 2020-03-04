import { Component, OnInit, EventEmitter, Inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Step } from "../../../model/stepModel";
import { DataClassStep2Component } from "../data-class-step2/data-class-step2.component";
import { DataClassStep1Component } from "../data-class-step1/data-class-step1.component";
import { StateHandlerService } from "../../../services/handlers/state-handler.service";
import { StateService } from "@uirouter/core";
import { ResourcesService } from "../../../services/resources.service";
import { MessageHandlerService } from "../../../services/utility/message-handler.service";
import { Observable } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { BroadcastService } from '../../../services/broadcast.service';

@Component({
    selector: 'app-data-class-main',
    templateUrl: './data-class-main.component.html',
    styleUrls: ['./data-class-main.component.sass']
})
export class DataClassMainComponent implements AfterViewInit {
    steps: Step[] = [];
    doneEvent = new EventEmitter<any>();
    parentDataModelId: any;
    grandParentDataClassId: any;
    parentDataClassId: any;


    constructor(private changeRef: ChangeDetectorRef, private title: Title, private stateService: StateService, private stateHandler: StateHandlerService, private resources: ResourcesService, private messageHandler: MessageHandlerService, private broadcastSvc: BroadcastService) { }

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        

        this.title.setTitle("New DataClass");

        this.parentDataModelId = this.stateService.params.parentDataModelId;
        this.grandParentDataClassId = this.stateService.params.grandParentDataClassId;
        this.parentDataClassId = this.stateService.params.parentDataClassId;

        if (!this.parentDataModelId) {
            this.stateHandler.NotFound({ location: false });
            return;
        }

        const step1 = new Step();
        step1.title = "Data Class Import Method";
        step1.component = DataClassStep1Component;
        step1.scope = this;
        step1.hasForm = true;
        step1.invalid = true;

        const step2 = new Step();
        step2.title = "Data Class Details";
        step2.component = DataClassStep2Component;
        step2.scope = this;
        step2.invalid = true;


        if (this.parentDataClassId) {
            this.resources.dataClass
                .get(this.parentDataModelId, this.grandParentDataClassId, this.parentDataClassId, null, null).toPromise()
                .then((result) => {
                    result.body.breadcrumbs.push(Object.assign([], result.body));
                    this.model.parent = result.body;
                    this.steps.push(step1);
                    this.steps.push(step2);
                });
        } else {
            this.resources.dataModel
                .get(this.parentDataModelId).toPromise().then((result) => {
                    result.body.breadcrumbs = [];
                    result.body.breadcrumbs.push(Object.assign({}, result.body));
                    this.model.parent = result.body;
                    this.steps.push(step1);
                    this.steps.push(step2);
                });
        }
    }

    model: any = {
        metadata: [],
        classifiers: [],

        parent: {},

        createType: "new",
        copyFromDataModel: [],

        selectedDataClasses: [],
        selectedDataClassesMap: {},


    };

    cancelWizard = () => {
        this.stateHandler.GoPrevious();
    }

    closeWizard = () => {
        this.stateHandler.GoPrevious();
    }
    

    save = () => {
        if (this.model.createType === 'new') {
            this.saveNewDataClass();
        } else {
            this.saveCopiedDataClasses();
        }
    };

    getMultiplicity = (resource, multiplicity) => {
        if (this.model[multiplicity] == "*") {
            this.model[multiplicity] = -1;
        }
        if (!isNaN(this.model[multiplicity])) {
            resource[multiplicity] = parseInt(this.model[multiplicity]);
        }
    };

    fireChanged = (tab: any) => {

        for (var i = 0; i < this.steps.length; i++) {

            var step: Step = this.steps[i];

            if (i === tab.selectedIndex) {
                if (step.compRef) {
                    step.compRef.instance.onLoad();
                    step.active = true;
                }
            } else {
                step.active = false;
            }
        }

    }

    saveCopiedDataClasses = () => {
        this.steps[1].compRef.instance.saveCopiedDataClasses();
    }

    saveNewDataClass = () => {
        var resource = {
            label: this.model.label,
            description: this.model.description,
            classifiers: this.model.classifiers.map((cls) => {
                return { id: cls.id };
            }),
            metadata: this.model.metadata.map((m) => {
                return {
                    key: m.key,
                    value: m.value,
                    namespace: m.namespace
                };
            }),
            minMultiplicity: null,
            maxMultiplicity: null
        };

        this.getMultiplicity(resource, "minMultiplicity");
        this.getMultiplicity(resource, "maxMultiplicity");


        var deferred;
        if (this.model.parent.domainType === "DataClass") {
            deferred = this.resources.dataClass.post(this.model.parent.dataModel, this.model.parent.id, "dataClasses", { resource: resource });
        } else {
            deferred = this.resources.dataModel.post(this.model.parent.id, "dataClasses", { resource: resource });
        }

        deferred.subscribe((response) => {
            this.messageHandler.showSuccess('Data Class saved successfully.');
            this.broadcastSvc.broadcast('$reloadFoldersTree');
            this.stateHandler.Go("dataClass", {
                dataModelId: response.body.dataModel || "",
                dataClassId: response.body.parentDataClass || "",
                id: response.body.id
            }, { reload: true, location: true });
        }, (error) => {
            this.messageHandler.showError('There was a problem saving the Data Class.', error);
        });
    };



}
