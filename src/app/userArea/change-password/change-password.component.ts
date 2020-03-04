import {
	Component,
	OnInit, ViewChild
} from '@angular/core';
import { ResourcesService } from "../../services/resources.service";
import { StateService } from "@uirouter/core";
import { StateHandlerService } from "../../services/handlers/state-handler.service";
import { UserDetailsResult } from "../../model/userDetailsModel";
import { SharedService } from "../../services/shared.service";
import { SecurityHandlerService } from "../../services/handlers/security-handler.service";
import { MessageService } from "../../services/message.service";
import { HelpDialogueHandlerService } from "../../services/helpDialogue.service";
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from "../../../environments/environment";

@Component({
	selector: 'app-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.sass']
})
export class ChangePasswordComponent implements OnInit {
	user: UserDetailsResult;
	currentUser: any;
	oldPassword: String;
	newPassword: String;
	confirm: String;
	message: String;
	afterSave: (result: { body: { id: any; }; }) => void;

	@ViewChild('changePasswordForm', {static:false}) changePasswordForm;
	backendUrl: string = environment.apiEndpoint;

	constructor(
		private resourcesService: ResourcesService,
		private stateService: StateService,
		private stateHandler: StateHandlerService,
		private sharedService: SharedService,
		private securityHandler: SecurityHandlerService,
		private messageService: MessageService,
		private messageHandler: MessageHandlerService,
		private helpDialogueService: HelpDialogueHandlerService,
		private sanitizer: DomSanitizer) {
		this.currentUser = this.securityHandler.getCurrentUser();
		this.newPassword = "";
		this.oldPassword = "";
		this.confirm = "";
		this.message = "";
	}

	ngOnInit() {
	}

	ngAfterViewInit() {

	}

	disabled = () => {
		return (this.newPassword != this.confirm ||
				this.newPassword == this.oldPassword ||
				this.newPassword == "" ||
				this.oldPassword == "");
	}

	changePassword = () => {

		var body = {
			oldPassword: this.oldPassword,
			newPassword: this.newPassword
		}
		this.resourcesService.catalogueUser.put(this.currentUser.id, 'changePassword',  { resource: body}).
			subscribe((result) => {
					this.messageHandler.showSuccess('Password updated successfully.');
					this.newPassword = "";
					this.oldPassword = "";
					this.confirm = "";
					this.message = "";
					this.changePasswordForm.reset();
				},(error) => {
				this.message = 'Error : ' + error.error.errors[0].message;
			});

	}



}


