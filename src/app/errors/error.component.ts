import { Component, OnInit } from '@angular/core';
import { MessageService } from '../services/message.service';
import { ClipboardService } from 'ngx-clipboard';

import { YoutrackService } from '../services/youtrack.service';
import { SharedService } from '../services/shared.service';

const columns: string[] = ['field', 'value'];

@Component({
  selector: 'mdm-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  showYouTrackLink = true;
  showDetails = false;
  lastError: any;

  dataSource: object[] = [];
  displayedColumns: string[] = columns;
  codeHighlighted = false;
  issueReported = false;
  issueReporting = false;
  isLoggedIn = false;
  summary: string;
  errorInSubmit = false;
  username: string;
  errorHeader: string;
  errorMessage: string;
  errorResolution: string;
  errorReportMessage: string;

  constructor(
    protected messageService: MessageService,
    protected clipboardService: ClipboardService,
    protected sharedService: SharedService,
    protected youtrackService: YoutrackService
  ) {
    this.lastError = messageService.lastError;
    this.isLoggedIn = sharedService.isLoggedIn();
    this.summary = `Error ${this.lastError.error?.status} : ${this.lastError.error?.message}`;
  }

  ngOnInit() {}

  copyToClipboard() {
    this.clipboardService.copyFromContent(
      JSON.stringify(this.lastError, null, 2)
    );
  }

  changeShowDetails() {
    this.showDetails = !this.showDetails;
  }

  reportIssueToYouTrack() {
    // make sure youTrack is configured
    if (!this.showYouTrackLink) {
      return;
    }
    this.issueReporting = true;

    const summary = this.lastError.error.message;
    const description = JSON.stringify(this.lastError, null, 2);

    this.youtrackService.reportIssueToYouTrack(summary, description).subscribe(
      (data: object) => {
        this.successfulReport();
      },
      (data: object) => {
        this.errorReport();
      }
    );
  }

  successfulReport() {
    // console.log(data);
    this.issueReporting = false;
    this.issueReported = true;
  }

  errorReport() {
    // console.log(data);
    this.issueReporting = false;
    this.errorInSubmit = true;
  }
}
