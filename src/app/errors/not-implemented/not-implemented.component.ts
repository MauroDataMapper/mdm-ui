import {Component, OnInit} from '@angular/core';
import {MessageService} from '../../services/message.service';
import {ClipboardService} from 'ngx-clipboard';
import {YoutrackService} from '../../services/youtrack.service';
import {SharedService} from '../../services/shared.service';
import {ErrorComponent} from '../error.component';
const columns: string[] = ['field', 'value'];
@Component({
  selector: 'mdm-not-implemented-error',
  templateUrl: '../error.component.html',
  styleUrls: []
})
export class NotImplementedComponent extends ErrorComponent implements OnInit {

  constructor(protected messageService: MessageService,
              protected clipboardService: ClipboardService,
              protected sharedService: SharedService,
              protected youtrackService: YoutrackService) {
    super(messageService, clipboardService, sharedService, youtrackService);
    this.errorHeader = 'Not Implemented';
    this.errorMessage = 'We\'re sorry, but the server responded to say that the feature you have requested has not yet been implemented';
    this.errorResolution = 'If you are running a development or test instance of the server, this may be something we\'re currently working on.';
    this.errorReportMessage = 'Alternatively, this may be an error in the user interface: please report the issue to us by using the link below.';

    console.log(this.lastError);
    this.dataSource.push({field: 'Message', value: this.lastError.message, code: false});
    this.dataSource.push({field: 'Status', value: this.lastError.status, code: false});
    this.dataSource.push({field: 'Path', value: this.lastError.url, code: false});
  }
}
