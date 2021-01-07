/* eslint-disable id-blacklist */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfileModalDataModel } from '@mdm/model/profilerModalDataModel';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit {
  profileData: Array<any>;

  saveInProgress = false;

  formOptionsMap = {
    Integer: 'number',
    String: 'text',
    Boolean: 'checkbox',
    boolean: 'checkbox',
    int: 'number',
    Date: 'date'
  };

  constructor(
    public dialogRef: MatDialogRef<EditProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfileModalDataModel,
    protected resourcesSvc: MdmResourcesService
  ) {
    this.profileData = data.profile;
  }

  ngOnInit(): void {}

  save() {
    // Save Changes
    this.dialogRef.close(this.profileData);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
