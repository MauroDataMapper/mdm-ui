/*
Copyright 2020-2023 University of Oxford and NHS England

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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@env/environment';
import { ApiPropertyResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { catchError } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export enum ImageChangeType {
  uploaded,
  removed,
  nochange
}

export interface ImageChangedEvent {
  changeEvent: ImageChangeType;
}

@Component({
  selector: 'mdm-theme-image',
  templateUrl: './theme-image.component.html',
  styleUrls: ['./theme-image.component.scss']
})
export class ThemeImageComponent implements OnInit {
  @Input() apiPropertyId: Uuid;
  @Output() imageSavedEvent = new EventEmitter();
  @Output() imageChangedEvent = new EventEmitter<ImageChangedEvent>();

  currentUser: any;
  imageVersion = 1;
  imageSource: any = '';
  themeImagePath: string;
  trustedUrl: any;
  afterSave: (result: { body: { id: any } }) => void;
  backendUrl: string = environment.apiEndpoint;
  showImage = false;
  originalValueWasDefault = false;
  DefaultImageMessage = 'Use default image';

  formGroup = new FormGroup({
    value: new FormControl('', [Validators.required]) // eslint-disable-line @typescript-eslint/unbound-method
  });

  get value() {
    return this.formGroup.controls.value;
  }

  constructor(
    private resourcesService: MdmResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private sanitizer: DomSanitizer,
    private resources: MdmResourcesService,
  ) {
    this.currentUser = this.securityHandler.getCurrentUser();
  }

  ngOnInit() {
    this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.backendUrl + '/admin/properties/' + this.apiPropertyId + '/image');

    this.resources.apiProperties
      .get(this.apiPropertyId)
      .pipe(
        catchError((errors) => {
          this.messageHandler.showError(
            'There was a problem getting the property.',
            errors
          );
          return [];
        })
      )
      .subscribe((data: ApiPropertyResponse) => {
        this.showImage = this.isUUID(data.body.value);
        this.showDefaultMessageIfRequired();
        this.originalValueWasDefault = (this.value?.value === this.DefaultImageMessage);
      });
  }

  // Saves the theme image
  public saveImage() {

    this.resourcesService.themeImage.update(this.apiPropertyId, { image: this.imageSource, type: this.getFileType() }).subscribe((result: { body }) => {
      this.messageHandler.showSuccess('Theme image updated successfully.');
      this.imageVersion++;
      this.imageSavedEvent.emit();

    }, error => {
      this.messageHandler.showError('There was a problem updating the Theme Image.', error);
    });
  }

  // When a file is selected
  fileChangeEvent(fileInput: any): void {
    this.readThis(fileInput.target);
    this.showImage = true;
    this.showDefaultMessageIfRequired();
    this.imageChangedEvent.emit({
      changeEvent: ImageChangeType.uploaded
    });
  }

  // When an image is removed
  imageRemoveEvent(): void {
    this.imageSource = null;
    this.showImage = false;
    this.showDefaultMessageIfRequired();
    this.imageChangedEvent.emit({
      changeEvent: (this.originalValueWasDefault) ? ImageChangeType.nochange : ImageChangeType.removed
    });
  }

  // Reads the file and populates imageSource in order to hold the whole file
  readThis(inputValue: any): void {
    const file: File = inputValue.files[0];
    const myReader: FileReader = new FileReader();
    myReader.onloadend = () => {
      this.imageSource = myReader.result;
    };
    myReader.readAsDataURL(file);
  }

  // Remove the theme image
  public removeImage() {
    this.resourcesService.themeImage.remove(this.apiPropertyId).subscribe(() => {
      this.messageHandler.showSuccess('Api Property image removed successfully.');
      this.imageVersion++;
      this.imageSavedEvent.emit({
        id: this.apiPropertyId
      });
    },
      error => {
        this.messageHandler.showError('There was a problem removing the user profile image.', error);
      }
    );
  }

  private isUUID(value: string): boolean {
    return (
      value.match(
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
      ) !== null
    );
  }

  private showDefaultMessageIfRequired() {
    if (this.showImage) {
      // This is required to avoid a mat-form-field must contain a MatFormFieldControl error
      this.value.setValue(' ');
    }
    else {
      this.value.setValue(this.DefaultImageMessage);
    }
  }

  private getFileType(): string {
    if (this.imageSource) {
      const fileType = this.imageSource.split(':').pop().split(';')[0];
      if (fileType) {
        if (fileType === 'image/jpg') {
          return 'image/jpeg'
        }
        else {
          return fileType
        }
      }  
    }
    return 'unknown'
  }
}
