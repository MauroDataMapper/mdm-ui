import {
	Component,
	OnInit,
	ViewEncapsulation,
	Input,
	QueryList,
	ViewChildren,
	Output,
	EventEmitter
} from '@angular/core';
import { UserDetailsResult, EditableUserDetails } from '../../model/userDetailsModel';
import { ResourcesService } from '../../services/resources.service';
import { SecurityHandlerService } from '../../services/handlers/security-handler.service';
import { MessageService } from '../../services/message.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-user-details',
	templateUrl: './user-details.component.html',
	styleUrls: ['./user-details.component.sass'],
	encapsulation: ViewEncapsulation.None
})
export class UserDetailsComponent implements OnInit {

	user: UserDetailsResult;
	editableForm: EditableUserDetails;
	public: false;
	isAdminUser: boolean;
	isLoggedIn: boolean;
	subscription: Subscription;
	isWritable: boolean;
	errorMessage = '';
	
	deleteInProgress: boolean;
	exporting: boolean;

	@Input('after-save') afterSave: any;
	@Input() editMode = false;
	@Input() editUsername: boolean;

	@ViewChildren('editableText') editForm: QueryList<any>;

	@Output() refreshUserDetails: EventEmitter<any> = new EventEmitter();

	constructor(
		private resourcesService: ResourcesService,
		private securityHandler: SecurityHandlerService,
		private messageService: MessageService) {

		this.userDetails();
	}

	ngOnInit() {

		this.editableForm = new EditableUserDetails();
		this.editableForm.visible = false;
		this.editableForm.deletePending = false;

		this.editableForm.show = () => {

			this.editableForm.visible = true;

			this.editForm.forEach(x => x.edit(
				{
					editing: true,
					focus: x._name === 'firstName' ? true : false
				}
			));
			// this.editForm.first.focus = true;
			// this.editForm.last.focus = false;
		};

		this.editableForm.cancel = () => {
			this.editForm.forEach(x => x.edit({ editing: false }));
			this.editableForm.visible = false;
			this.editableForm.validationError = false;

			this.refreshUserDetails.emit(null);
		};
	}

	userDetails(): any {

		// subscribe to parent component userDetails messages;
		this.subscription = this.messageService.getUserDetails().subscribe(message => {

			this.user = message;
			this.setEditableForm();

			if (this.user != null) {
				this.watchUserDetailEditable();
			}

		});
	}

	checkEmailExists(data: string) {

		return this.resourcesService.catalogueUser.get(null, 'userExists/' + data, null);
	}

	watchUserDetailEditable() {
		this.isWritable = this.securityHandler.showIfRoleIsWritable(this.user);
	}

	formBeforeSave = function() {

		this.editMode = false;
		this.errorMessage = '';

		this.checkEmailExists(this.editableForm.username).subscribe(result => {

			if(!this.editableForm.username){
				return "Email must be present";
			}

			if(result.body){
				return 'Email address already exists.';
			}

			const userDetails = {
				id: this.user['id'],
				firstName:	this.editableForm.firstName,
				lastName: this.editableForm.lastName,
				organisation: this.editableForm.organisation,
				jobTitle: this.editableForm.jobTitle
			};
	
			if (this.validateInput(this.user.firstName) && this.validateInput(this.user.lastName)) {
	
				this.resourcesService.catalogueUser.put(userDetails.id, null, { resource: userDetails }).subscribe(result => {
	
					if (this.afterSave) {
						this.afterSave(result);
					}
	
					this.messageHandler.showSuccess('User details updated successfully.');
					this.editableForm.visible = false;
					this.editForm.forEach(x => x.edit({ editing: false }));
				},
				error => {
					this.messageHandler.showError('There was a problem updating the User Details.', error);
				});
			}
		

		});

	};

	validateInput(value): any {

		if (value != null && (value.trim().length === 0)) {

			this.editableForm.validationError = true;
			return false;
		} else {

			this.editableForm.validationError = false;
			return true;
		}
	}

	showForm() {
		this.editableForm.show();
	}

	ngOnDestroy() {
		// unsubscribe to ensure no memory leaks
		this.subscription.unsubscribe();
	}

	onCancelEdit() {
		this.errorMessage = '';
		this.editMode = false; // Use Input editor when adding a new folder.
	}

	setEditableForm() {
		this.editableForm.firstName = this.user.firstName;
		this.editableForm.lastName = this.user.lastName;
		this.editableForm.organisation = this.user.organisation;
		this.editableForm.jobTitle = this.user.jobTitle;
	}
}
