import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'data-type-list-buttons',
    templateUrl: './data-type-list-buttons.component.html',
    styleUrls: ['./data-type-list-buttons.component.sass']
})
export class DataTypeListButtonsComponent implements OnInit {

    constructor() { }

    @Output("delete-rows") deleteRows = new EventEmitter<any>();
    @Input("add") add: any;
    @Input("display-records") mcDisplayRecords: any[];
    @Input("delete-in-progress") deleteInProgress = false;
    @Input("show-content-dropdown") showContentDropdown =  false;
    @Input("addDataClass") addDataClass : any;
    @Input("addDataElement") addDataElement : any;
	@Input("show-delete-button") showDeleteButton = true;

    deletePending: boolean;
    textLocation: string;
    deleteWarning: string;

    ngOnInit() {
        this.textLocation = "left";
        this.deletePending = false;
    }

    confirmDeleteClicked = () => {
        if (this.deleteRows) {
            this.deletePending = false;
            this.deleteInProgress = true;

            this.deleteRows.emit();
           
        }
    };

    onAskDelete = () => {
        var showDelete = false;
        this.mcDisplayRecords.forEach((record) => {
            if (record.checked === true) {
                showDelete = true;
            }
        });
        if (showDelete) {
            this.deletePending = true;
        } else {
            this.deleteWarning = "Please select one or more elements.";
        }
    };

    cancelDeleteClicked =  () => {
        this.deletePending = false;
    };

}
