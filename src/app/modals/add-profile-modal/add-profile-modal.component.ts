/* eslint-disable id-blacklist */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-add-profile-modal',
  templateUrl: './add-profile-modal.component.html',
  styleUrls: ['./add-profile-modal.component.scss']
})
export class AddProfileModalComponent implements OnInit {
  allUnusedProfiles: Array<any> = [];

  constructor(
    public dialogRef: MatDialogRef<AddProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    protected resourcesSvc: MdmResourcesService
  ) {}

  ngOnInit(): void {
    this.resourcesSvc.profile
      .unusedProfiles(this.data.domainType, this.data.domainId)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUnusedProfiles.push(prof);
        });
      });
  }

  save() {
    // Save Changes
    this.dialogRef.close(this.data.selectedProfile);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
