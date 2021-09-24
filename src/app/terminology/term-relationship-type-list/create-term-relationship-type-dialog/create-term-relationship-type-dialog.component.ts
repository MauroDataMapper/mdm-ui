import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { TermRelationshipTypeDetail } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'mdm-create-term-relationship-type-dialog',
  templateUrl: 'create-term-relationship-type-dialog.component.html',
  styleUrls: ['create-term-relationship-type-dialog.component.scss']
})
export class CreateTermRelationshipTypeDialogComponent implements OnInit {

  form: FormGroup;

  submitting = false;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CreateTermRelationshipTypeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      label: [this.data.label, Validators.required]
    });
  }

  submit(form: FormGroup) {
    this.submitting = true;
    this.resources.termRelationshipTypes.save(this.data.terminology.id, {
      label: form.value.label
    }).subscribe((response: HttpResponse<TermRelationshipTypeDetail>) => {
      if (response.ok) {
        this.dialogRef.close(response.body);
      } else {
        this.messageHandler.showWarning(response.body);
      }
      this.submitting = false;
    },
    error => {
      this.messageHandler.showError(error);
      this.submitting = false;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
