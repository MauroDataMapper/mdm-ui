/*
Copyright 2020 University of Oxford

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { UserDetailsResult } from '@mdm/model/userDetailsModel';
import { SharedService } from '@mdm/services/shared.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageService } from '@mdm/services/message.service';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { from } from 'rxjs';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '@env/environment';
import { DialogPosition } from '@angular/material/dialog';

@Component({
  selector: 'mdm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit, AfterViewInit {
  user: UserDetailsResult;
  currentUser: any;
  imageVersion = 1;
  imageThumb: any = '';
  imageSource: any = '';
  isImageLoaded = false;
  profileImagePath: string;
  imageChangedEvent: any = '';
  trustedUrl: SafeUrl;
  afterSave: (result: { body: { id: any } }) => void;
  backendUrl: string = environment.apiEndpoint;

  @ViewChild('imgCropperComp', { static: true }) imgCropperComp;

  constructor(
    private resourcesService: MdmResourcesService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private sharedService: SharedService,
    private securityHandler: SecurityHandlerService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private helpDialogueService: HelpDialogueHandlerService,
    private sanitizer: DomSanitizer
  ) {
    this.currentUser = this.securityHandler.getCurrentUser();
  }

  ngOnInit() {
    this.userDetails();
  }

  // Get the user details data
  userDetails() {
    this.resourcesService.catalogueUser.get(this.currentUser.id, null, null).subscribe((result: { body: UserDetailsResult }) => {
      this.user = result.body;

      this.messageService.sendUserDetails(this.user);

      // Create a trusted image URL
      this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.backendUrl}/catalogueUsers/${this.user.id}/image?thumnail${this.imageVersion}`);
    },
      err => {
        this.messageHandler.showError('There was a problem loading user details.', err);
      });
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
    const imageData = { image: this.imageThumb, type: 'png' };

    from(this.resourcesService.catalogueUser.put(this.user.id, 'image', { resource: imageData })).subscribe(() => {
        this.messageHandler.showSuccess('User profile image updated successfully.');
        this.imageVersion++;
        this.isImageLoaded = null;
        this.userDetails();
      },
      error => {
        this.messageHandler.showError('There was a problem updating the User Details.', error);
      }
    );
  }

  // When a file is selected
  fileChangeEvent(fileInput: any): void {
    this.imgCropperComp.imageChangedEvent = fileInput;
    this.readThis(fileInput.target);
    this.isImageLoaded = true;
  }

  // Reads the file and populates imageSource in order to hold the whole file
  readThis(inputValue: any): void {
    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();
    myReader.onloadend = e => {
      this.imageSource = myReader.result;
    };
    myReader.readAsDataURL(file);
  }

  // Remove the profile image
  public removeProfileImage() {
    from(this.resourcesService.catalogueUser.delete(this.user.id, 'image')).subscribe(() => {
        this.messageHandler.showSuccess('User profile image removed successfully.');
        this.imageVersion++;
        this.isImageLoaded = null;
        this.userDetails();
      },
      error => {
        this.messageHandler.showError('There was a problem removing the user profile image.', error);
      }
    );
  }

  // Cancel the add image process
  public clear() {
    this.isImageLoaded = false;
  }

  public loadHelp() {
    this.helpDialogueService.open('User_profile', { my: 'right top', at: 'bottom' } as DialogPosition);
  }
}
