import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from '@mdm/services/message.service';
import { Subscription } from 'rxjs';
import { DataModelResult } from '@mdm/model/dataModelModel';

@Component({
    selector: 'mdm-element-status',
    templateUrl: './element-status.component.html',
    // styleUrls: ['./element-status.component.sass']
})
export class ElementStatusComponent implements OnInit {

    @Input() result: DataModelResult;

    constructor(private messageService: MessageService) {

        this.DataModelDetails();
    }

    ngOnInit() {
    }

    DataModelDetails(): any {

    }

}
