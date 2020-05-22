import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { UserDetailsResult } from '@mdm/model/userDetailsModel';
import { ResourcesService } from '@mdm/services/resources.service';
import { MessageService } from '@mdm/services/message.service';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';

@Component({
  selector: 'mdm-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  user: UserDetailsResult;
  public: false;
  subscription: Subscription;
  isWritable: boolean;
  errorMessage = '';

  @Input() afterSave: any;

  @Output() refreshUserDetails: EventEmitter<any> = new EventEmitter();

  constructor(
    private resourcesService: ResourcesService,
    private messageService: MessageService,
    private title: Title,
    private messageHandler: MessageHandlerService
  ) {
    this.userDetails();
  }

  ngOnInit() {
    this.title.setTitle('My profile');
  }

  userDetails(): any {
    // subscribe to parent component userDetails messages;
    this.subscription = this.messageService.getUserDetails().subscribe((message) => {
        this.user = message;
      });
  }

  checkEmailExists(data: string) {
    return this.resourcesService.catalogueUser.get(null, `userExists/${data}`, null);
  }

  formBeforeSave = function() {
    this.errorMessage = '';
    this.checkEmailExists(this.user.emailAddress).subscribe(() => {
      const userDetails = {
        id: this.user.id,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        organisation: this.user.organisation,
        jobTitle: this.user.jobTitle || '',
      };
      if (this.validateInput(this.user.firstName) && this.validateInput(this.user.lastName) && this.validateInput(this.user.organisation)) {
        this.resourcesService.catalogueUser.put(userDetails.id, null, { resource: userDetails }).subscribe(result => {
              if (this.afterSave) {
                this.afterSave(result);
              }
              this.messageHandler.showSuccess('User details updated successfully.');
            }, error => {
              this.messageHandler.showError('There was a problem updating the User Details.', error);
            }
          );
      }
    });
  };

  validateInput(value): any {
    if (value != null && value.trim().length === 0) {
      return false;
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // unsubscribe to ensure no memory leaks
  }
}
