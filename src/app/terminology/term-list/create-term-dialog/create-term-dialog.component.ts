import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { CatalogueItemDomainType, TermDetail } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'mdm-create-term-dialog',
  templateUrl: 'create-term-dialog.component.html',
  styleUrls: ['create-term-dialog.component.scss']
})
export class CreateTermDialogComponent implements OnInit {

  form: FormGroup;

  submitting = false;

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CreateTermDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      code: [this.data.code, Validators.required],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      definition: [this.data.definition, Validators.required],
      description: [this.data.description]
    });
  }

  submit(form: FormGroup) {
    this.submitting = true;
    this.resources.terms.save(this.data.terminology.id, {
      domainType: CatalogueItemDomainType.Term,
      code: form.value.code,
      definition: form.value.definition,
      description: form.value.description
    }).subscribe((response: HttpResponse<TermDetail>) => {
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
