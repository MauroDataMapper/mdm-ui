import {Component, OnInit} from '@angular/core';
import {MessageService} from '../../services/message.service';
import {ClipboardService} from 'ngx-clipboard';
import {YoutrackService} from '../../services/youtrack.service';
import {SharedService} from '../../services/shared.service';
import {ErrorComponent} from '../error.component';

const columns: string[] = ['field', 'value'];
@Component({
  selector: 'mdm-not-found-error',
  templateUrl: '../error.component.html',
  styleUrls: []
})
export class NotFoundComponent extends ErrorComponent implements OnInit {
  constructor(protected messageService: MessageService,
              protected clipboardService: ClipboardService,
              protected sharedService: SharedService,
              protected youtrackService: YoutrackService) {
    super(messageService, clipboardService, sharedService, youtrackService);
    this.errorHeader = 'Not Found';
    this.errorMessage = 'We\'re sorry, but the server returned a \'Not Found\' error';
    this.errorResolution = 'You may need to check that the item you have requested actually exists, and that you have permission to view it';
    this.errorReportMessage = 'Alternatively, this may be an error in the user interface: please report the issue to us by using the link below.';

    this.dataSource.push({field: 'Message', value: this.lastError.message, code: false});
    this.dataSource.push({field: 'Status', value: this.lastError.status, code: false});
    this.dataSource.push({field: 'Path', value: this.lastError.url, code: false});
  }
}
