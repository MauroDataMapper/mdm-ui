import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddProfileModalComponent } from '@mdm/modals/add-profile-modal/add-profile-modal.component';
import { EditProfileModalComponent } from '@mdm/modals/edit-profile-modal/edit-profile-modal.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { BaseComponent } from '@mdm/shared/base/base.component';

@Component({
  template : ''
})
export class ProfileBaseComponent extends BaseComponent {

  allUsedProfiles: any[] = [];
  allUnUsedProfiles: any[] = [];
  currentProfileDetails: any = {};
  descriptionView = 'default';

  catalogueItem: any;

  constructor(protected resourcesService: MdmResourcesService,
    protected dialog: MatDialog,
    protected editingService: EditingService,
    protected messageHandler: MessageHandlerService,
   ) {
    super();
     }

  deleteProfile() {
    if (this.currentProfileDetails) {
      this.dialog
        .openConfirmationAsync({
          data: {
            title: 'Are you sure you want to delete this Profile?',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message: `<p class="marginless">${this.currentProfileDetails.name} will be deleted, are you sure? </p>`
          }
        })
        .subscribe(() => {
          this.resourcesService.profile
            .deleteProfile(
              this.catalogueItem.domainType,
              this.catalogueItem.id,
              this.currentProfileDetails.namespace,
              this.currentProfileDetails.name
            )
            .subscribe(
              () => {
                this.messageHandler.showSuccess('Profile deleted successfully');
                this.descriptionView = 'default';
                this.UsedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
                this.UnUsedProfiles(this.catalogueItem.domainType, this.catalogueItem.id);
                this.changeProfile();
              },
              (error) => {
                this.messageHandler.showError(
                  'Unable to Delete Profile',
                  error
                );
              }
            );
        });
    }
  }

  editProfile = (
    isNew: boolean,
  ) => {
    this.editingService.start();
    let prof = this.allUsedProfiles.find((x) => x.value === this.descriptionView);

    if (!prof) {
      prof = this.allUnUsedProfiles.find((x) => x.value === this.descriptionView);
    }

    const dialog = this.dialog.open(EditProfileModalComponent, {
      data: {
        profile: this.currentProfileDetails,
        profileName: prof.display,
        catalogueItem: this.catalogueItem,
        isNew
      },
      disableClose: true,
      panelClass: 'full-width-dialog'
    });

    this.editingService.configureDialogRef(dialog);

    dialog.afterClosed().subscribe((result) => {
      if (result) {
        const splitDescription = prof.value.split('/');
        const data = JSON.stringify(result);
        this.resourcesService.profile
          .saveProfile(
            this.catalogueItem.domainType,
            this.catalogueItem.id,
            splitDescription[0],
            splitDescription[1],
            data
          )
          .subscribe(
            () => {
              this.editingService.stop();
              this.resourcesService.profile
                .profile(
                  this.catalogueItem.domainType,
                  this.catalogueItem.id,
                  splitDescription[0],
                  splitDescription[1]
                )
                .subscribe((body) => {
                  this.currentProfileDetails = body.body;
                  this.currentProfileDetails.namespace = splitDescription[0];
                  this.currentProfileDetails.name = splitDescription[1];
                  if (isNew) {
                    this.messageHandler.showSuccess('Profile Added');
                    this.UsedProfiles(
                      this.catalogueItem.domainType,
                      this.catalogueItem.id
                    );
                  } else {
                    this.messageHandler.showSuccess('Profile Edited Successfully');
                  }
                });
            },
            (error) => {
              this.messageHandler.showError('error saving', error.message);
            }
          );
      } else if (isNew) {
        this.descriptionView = 'default';
        this.changeProfile();
      }
    });
  };

  async UsedProfiles(domainType: string, id: any) {
    await this.resourcesService.profile
      .usedProfiles(domainType, id)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        this.allUsedProfiles = [];
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUsedProfiles.push(prof);
        });
      });
  }

  async UnUsedProfiles(
    domainType: string,
    id: any
  ) {
    await this.resourcesService.profile
      .unusedProfiles(domainType, id)
      .subscribe((profiles: { body: { [x: string]: any } }) => {
        profiles.body.forEach((profile) => {
          const prof: any = [];
          prof['display'] = profile.displayName;
          prof['value'] = `${profile.namespace}/${profile.name}`;
          this.allUnUsedProfiles.push(prof);
        });
      });
  }

  async changeProfile() {
    if (
      this.descriptionView !== 'default' &&
      this.descriptionView !== 'other' &&
      this.descriptionView !== 'addnew'
    ) {
      const splitDescription =  this.descriptionView.split('/');
      const response = await this.resourcesService.profile.profile(
        this.catalogueItem.domainType,
        this.catalogueItem.id,
        splitDescription[0],
        splitDescription[1]
      ).toPromise();

      this.currentProfileDetails = response.body;
      this.currentProfileDetails.namespace = splitDescription[0];
      this.currentProfileDetails.name = splitDescription[1];
    } else if ( this.descriptionView === 'addnew') {
      const dialog = this.dialog.open(AddProfileModalComponent, {
        data: {
          domainType:  this.catalogueItem.domainType,
          domainId: this.catalogueItem.id
        }
      });

      this.editingService.configureDialogRef(dialog);

      dialog.afterClosed().subscribe((newProfile) => {
        if (newProfile) {
          const splitDescription = newProfile.split('/');
          this.resourcesService.profile
            .profile(
              this.catalogueItem.domainType,
              this.catalogueItem.id,
              splitDescription[0],
              splitDescription[1],
              ''
            )
            .subscribe(
              (body) => {
                this.descriptionView = newProfile;
                this.currentProfileDetails = body.body;
                this.currentProfileDetails.namespace = splitDescription[0];
                this.currentProfileDetails.name = splitDescription[1];
                this.editProfile(
                  true
                );
              },
              (error) => {
                this.messageHandler.showError('error saving', error.message);
              }
            );
        }
      });
    } else {
      this.currentProfileDetails = null;
    }
  }

}
