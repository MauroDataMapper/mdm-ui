import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { Subscription } from 'rxjs';
import { DataModelResult } from '../../model/dataModelModel';

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
