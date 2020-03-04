import {
	Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { ResourcesService } from '../../services/resources.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { UserDetailsResult } from '../../model/userDetailsModel';
import { SharedService } from '../../services/shared.service';
import { SecurityHandlerService } from '../../services/handlers/security-handler.service';
import { MessageService } from '../../services/message.service';
import { HelpDialogueHandlerService } from '../../services/helpDialogue.service';
import { from } from 'rxjs';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { DialogPosition } from '@angular/material/dialog';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit {
	user: UserDetailsResult;
	editMode = false;
	currentUser: any;
	imageVersion = 1;
	imageThumb: any = '';
	imageSource: any = '';
	isImageLoaded: boolean;
	profileImagePath: string;
	imageChangedEvent: any = '';
	trustedUrl: SafeUrl;
	afterSave: (result: { body: { id: any; }; }) => void;

	backendUrl: string = environment.apiEndpoint;

	@ViewChild('imgCropperComp', { static: true }) imgCropperComp;

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
	}

	ngOnInit() {
		this.editMode = true;
		this.userDetails();
	}

	// Get the user details data
	userDetails() {
		this.resourcesService.catalogueUser.get(this.currentUser.id, null, null).subscribe((result: { body: UserDetailsResult; }) => {

			this.user = result.body;

			this.messageService.sendUserDetails(this.user);

			// Create a trusted image URL
			this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.backendUrl + '/catalogueUsers/' + this.user.id + '/image?thumnail' + this.imageVersion + '');
		}),
			(err) => {
				this.messageHandler.showError('There was a problem loading user details.', err);
			};
	}

	sendMessage(): void {
		// send message to subscribers via observable subject
		this.messageService.sendUserDetails(this.user);
	}

	ngAfterViewInit() {
		this.isImageLoaded = false;
	}

	// This is emit event in order to know when to display the save button
	imageCropped(prm: any) {
		this.isImageLoaded = true;
		this.imageThumb = prm;
	}

	// Saves the selected profile picture
	public savePicture() {
		let imageData = {image: this.imageThumb, type: 'png' };

		let call = from(this.resourcesService.catalogueUser.put(this.user.id, 'image', { resource: imageData })).subscribe(result => {
			this.messageHandler.showSuccess('User profile image updated successfully.');
			this.imageVersion++;
			this.isImageLoaded = null;

			this.userDetails();
		},
			error => {
				this.messageHandler.showError('There was a problem updating the User Details.', error);
			});
	}

	// When a file is selected
	fileChangeEvent(fileInput: any): void {
		this.imgCropperComp.imageChangedEvent = fileInput;
		this.readThis(fileInput.target);
		this.isImageLoaded = true;
	}

	// Reads the file and populates imageSource in order to hold the whole file
	readThis(inputValue: any): void {
		let file: File = inputValue.files[0];
		let myReader: FileReader = new FileReader();

		myReader.onloadend = (e) => {
			this.imageSource = myReader.result;
		};
		myReader.readAsDataURL(file);
	}

	// Remove the profile image
	public removeProfileImage() {
		let call = from(this.resourcesService.catalogueUser.delete(this.user.id, 'image')).subscribe(result => {
			this.messageHandler.showSuccess('User profile image removed successfully.');
			this.imageVersion++;
			this.isImageLoaded = null;

			this.userDetails();
		},
			error => {
				this.messageHandler.showError('There was a problem removing the user profile image.', error);
			});
	}

	// Cancel the add image process
	public clear() {
		this.isImageLoaded = false;
	}

	public loadHelp() {
		// this.helpDialogueService.position = { X: event.currentTarget.value.split(" ")[0], Y: event.currentTarget.value.split(" ")[1] };
		this.helpDialogueService.open('User_profile', { my: 'right top', at: 'bottom' } as DialogPosition);
	}
}


