/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { UserDetailsResult } from '@mdm/model/userDetailsModel';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageService } from '@mdm/services/message.service';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@env/environment';
import { BroadcastService } from '@mdm/services/broadcast.service';

@Component({
  selector: 'mdm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {
  @ViewChild('imgCropperComp', { static: true }) imgCropperComp;
  user: UserDetailsResult;
  currentUser: any;
  imageVersion = 1;
  imageThumb: any = '';
  imageSource: any = '';
  isImageLoaded = false;
  isChangingProfileImage = false;
  profileImagePath: string;
  imageChangedEvent: any = '';
  trustedUrl: any;
  afterSave: (result: { body: { id: any } }) => void;
  backendUrl: string = environment.apiEndpoint;


  constructor(
    private resourcesService: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageService: MessageService,
    private messageHandler: MessageHandlerService,
    private helpDialogueService: HelpDialogueHandlerService,
    private sanitizer: DomSanitizer,
    private broadcast: BroadcastService
  ) {
    this.currentUser = this.securityHandler.getCurrentUser();
  }

  ngOnInit() {
    this.userDetails();
  }

  // Get the user details data
  userDetails() {
    this.resourcesService.catalogueUser.get(this.currentUser.id).subscribe((result: { body: UserDetailsResult }) => {
      this.user = result.body;
      this.messageService.sendUserDetails(this.user);
      this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.backendUrl + '/catalogueUsers/' + this.user.id + '/image');
    }, err => {
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

    this.resourcesService.userImage.update(this.user.id, { image: this.imageThumb, type: 'image/png' }).subscribe(() => {
      this.messageHandler.showSuccess('User profile image updated successfully.');
      this.imageVersion++;
      this.isImageLoaded = null;
      this.isChangingProfileImage = false;
      this.broadcast.dispatch('profileImageUpdated');
      this.userDetails();
    }, error => {
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
    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();
    myReader.onloadend = () => {
      this.isChangingProfileImage = true;
      this.imageSource = myReader.result;
    };
    myReader.readAsDataURL(file);
  }

  // Remove the profile image
  public removeProfileImage() {
    this.resourcesService.userImage.remove(this.user.id).subscribe(() => {
      this.messageHandler.showSuccess('User profile image removed successfully.');
      this.imageVersion++;
      this.isImageLoaded = null;
      this.userDetails();
      this.broadcast.dispatch('profileImageUpdated');
    },
      error => {
        this.messageHandler.showError('There was a problem removing the user profile image.', error);
      }
    );
  }

  // Cancel the add image process
  public clear() {
    this.isImageLoaded = false;
    this.isChangingProfileImage = false;
  }

  public loadHelp() {
    this.helpDialogueService.open('User_profile');
  }
}
