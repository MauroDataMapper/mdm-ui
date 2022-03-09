import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Branchable, Modelable } from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export const defaultBranchName = 'main';

const defaultBranchNameValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    return defaultBranchName.localeCompare(control.value as string, undefined, { sensitivity: 'accent' }) === 0
      ? { invalidBranchName: { value: control.value } }
      : null;
  };
};

export interface ChangeBranchNameModalData {
  model: Modelable & Branchable
}

export interface ChangeBranchNameModalResult {
  status: ModalDialogStatus;
  branchName?: string;
}

@Component({
  selector: 'mdm-change-branch-name-modal',
  templateUrl: './change-branch-name-modal.component.html',
  styleUrls: ['./change-branch-name-modal.component.scss']
})
export class ChangeBranchNameModalComponent implements OnInit {
  model: Modelable & Branchable;
  newBranchName: string;
  formGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ChangeBranchNameModalComponent, ChangeBranchNameModalResult>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeBranchNameModalData
  ) {
    this.formGroup = new FormGroup({
      branchName: new FormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        defaultBranchNameValidator()
      ])
    });
  }

  get branchName() {
    return this.formGroup.get('branchName');
  }

  ngOnInit(): void {
    this.model = this.data.model;
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  change() {
    if (this.formGroup.invalid) {
      return;
    }

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      branchName: this.branchName.value
    });
  }

}
