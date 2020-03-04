import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-data-class-step1',
    templateUrl: './data-class-step1.component.html',
    styleUrls: ['./data-class-step1.component.sass']
})
export class DataClassStep1Component implements OnInit {

    step: any;


    modelVal: any;
    get model() {
        return this.modelVal;
    }
    set model(val) {
        this.modelVal = val;
        this.validate();
    }

    constructor(private changeRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.model = this.step.scope.model;
    }

    ngDoCheck() {
       this.validate();
    }

    onSelect = (dataModel) => {
        this.model.selectedDataTypes = [];
        this.model.selectedDataClassesMap = [];
    };

    onLoad() {
        
    }

    validate = () => {

        if (!this.model.createType) {
            this.step.invalid = true;
            return;
        }

        if (this.model.createType === 'copy' && this.model.copyFromDataModel.length === 0) {
            this.step.invalid = true;
            return;
        }


        this.step.invalid = false;
    };


    selectCreateType = (createType) => {
        this.model.createType = createType;
    };
}
