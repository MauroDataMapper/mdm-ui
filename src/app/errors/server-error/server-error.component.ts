import {Component, OnInit} from '@angular/core';
import {MessageService} from '../../services/message.service';
import {ClipboardService} from 'ngx-clipboard';
import {YoutrackService} from '../../services/youtrack.service';
import {SharedService} from '../../services/shared.service';
import {ErrorComponent} from '../error.component';
const columns: string[] = ['field', 'value'];
@Component({
    selector: 'app-server-error',
    templateUrl: '../error.component.html',
    styleUrls: []
})
export class ServerErrorComponent extends ErrorComponent implements OnInit {

    constructor(protected messageService: MessageService,
                protected clipboardService: ClipboardService,
                protected sharedService: SharedService,
                protected youtrackService: YoutrackService) {
        super(messageService, clipboardService, sharedService, youtrackService);
        this.errorHeader = 'Server Error';
        this.errorMessage = 'We\'re sorry, but the server responded with an error message.';
        this.errorResolution = 'This may be a temporary issue, so you might like to try again later';
        this.errorReportMessage = 'Alternatively, if this is the first time you have encountered this error, please report the issue to us by using the link below:';

        this.dataSource.push({field: 'Reason', value: this.lastError.error.reason, code: false});
        this.dataSource.push({field: 'Status', value: this.lastError.error.status, code: false});
        this.dataSource.push({field: 'Error Code', value: this.lastError.error.errorCode, code: false});
        this.dataSource.push({field: 'Path', value: this.lastError.error.path, code: false});
        this.dataSource.push({field: 'Dev Mode', value: this.lastError.error.devMode, code: false});
        this.dataSource.push({field: 'Message', value: this.lastError.error.message, code: false});
        this.dataSource.push({field: 'Exception', value: this.lastError.error.exception, code: true});

    }
}

