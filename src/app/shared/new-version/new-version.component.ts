import { Component,  OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService, ValidatorService, MessageHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'mdm-new-version',
  templateUrl: './new-version.component.html',
  styleUrls: ['./new-version.component.scss']
})
export class NewVersionComponent implements OnInit {

  step = 1;
  catalogueItem: any;
  domainType: string;
  errors: { label: string } | undefined;
  versionType: 'Fork' | 'Branch' | 'Version' | undefined;
  processing: boolean;
  form = {
    label: '',
    copyPermissions: false,
    copyDataFlows: false,
    moveDataFlows: false
  };

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private validator: ValidatorService,
    private messageHandler: MessageHandlerService,
    private title: Title
  ) {

  }

  ngOnInit(): void {
    this.title.setTitle('New Model Version');

    this.domainType = this.uiRouterGlobals.params.domainType;


    if (!this.uiRouterGlobals.params.id || !this.domainType) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    this.resources[this.domainType]
      .get(this.uiRouterGlobals.params.id)
      .subscribe((response: any) => {
        this.catalogueItem = response.body;
      });
  }

  validate() {
    this.errors = null;
    if (!this.versionType) {
      return false;
    }
    if (this.versionType === 'Fork') {
      if (this.validator.isEmpty(this.form.label)) {
        this.errors = this.errors || undefined;
        this.errors.label = 'Model name can not be empty!';
      } else if (
        this.form.label.trim().toLowerCase() ===
        this.catalogueItem.label.trim().toLowerCase()
      ) {
        this.errors = this.errors || undefined;
        this.errors.label = `The name should be different from the current version name ${this.catalogueItem.label}`;
      }
    }
    if (this.versionType === 'Branch') {
      if (this.validator.isEmpty(this.form.label)) {
        this.errors = this.errors || undefined;
        this.errors.label = 'Branch name can not be empty!';
      }
    }
    return !this.errors;
  }

  versionTypeChecked() {
    this.step++;
  }

  save() {
    if (!this.validate()) {
      return;
    }
    if (this.versionType === 'Fork') {
      const resource = {
        label: this.form.label,
        copyPermissions: this.form.copyPermissions,
        copyDataFlows: this.form.copyDataFlows
      };
      this.processing = true;

      this.resources[this.domainType]
        .newForkModel(this.catalogueItem.id, resource)
        .pipe(finalize(() => (this.processing = false)))
        .subscribe(
          (response) => {
            this.messageHandler.showSuccess(
              'New Data Model version created successfully.'
            );
            this.stateHandler.Go(
              this.domainType,
              { id: response.body.id },
              { reload: true }
            );
          },
          (error) => {
            this.processing = false;
            this.messageHandler.showError(
              'There was a problem creating the new Data Model version.',
              error
            );
          }
        );
    } else if (this.versionType === 'Version') {
      this.processing = true;
      this.resources[this.domainType]
        .newBranchModelVersion(this.catalogueItem.id, {})
        .subscribe(
          (response) => {
            this.processing = false;
            this.messageHandler.showSuccess(
              'New Document Model version created successfully.'
            );
            this.stateHandler.Go(
              this.domainType,
              { id: response.body.id },
              { reload: true }
            );
          },
          (error) => {
            this.processing = false;
            this.messageHandler.showError(
              'There was a problem creating the new Document Model version.',
              error
            );
          }
        );
    } else if (this.versionType === 'Branch') {
      let resources = {};
      if (this.form.label !== null && this.form.label !== '') {
        resources = { branchName: this.form.label };
      }

      this.processing = true;
      this.resources[this.domainType]
        .newBranchModelVersion(this.catalogueItem.id, resources)
        .subscribe(
          (response) => {
            this.processing = false;
            this.messageHandler.showSuccess('New Branch created successfully.');
            this.stateHandler.Go(
              this.domainType,
              { id: response.body.id },
              { reload: true }
            );
          },
          (error) => {
            this.processing = false;
            this.messageHandler.showError(
              'There was a problem creating the new Document Model version.',
              error
            );
          }
        );
    }
  }

  cancel = () => {
    this.stateHandler.Go(this.domainType, {
      id: this.catalogueItem.id
    });
  };

}
