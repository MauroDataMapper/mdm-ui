import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { CatalogueItemDomainType, ContainerDomainType, ModelDomainType, TermDetail, TerminologyDetail, TermRelationship, TermRelationshipType } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'mdm-create-term-relationship-dialog',
  templateUrl: 'create-term-relationship-dialog.component.html',
  styleUrls: ['create-term-relationship-dialog.component.scss']
})
export class CreateTermRelationshipDialogComponent implements OnInit, OnDestroy {

  form: FormGroup;
  formWithExistingTerm: FormGroup;
  formWithNewTerm: FormGroup;
  terminology: TerminologyDetail;
  submitting = false;

  private subscriptions = new Subscription();
  private _relationshipTypes = new BehaviorSubject<TermRelationshipType[]>([]);
  private _sourceTerm = new BehaviorSubject<TermDetail>(null);
  private _relationshipType = new BehaviorSubject<TermRelationshipType>(null);
  private _targetTerm = new BehaviorSubject<TermDetail>(null);
  private _useExistingTerms = new BehaviorSubject<boolean>(true);

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CreateTermRelationshipDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.terminology = this.data.terminology;
    this.terminology['hasChildren'] = true;
    this.resources.tree.get(ContainerDomainType.Folders, ModelDomainType.Terminologies, this.terminology.id).subscribe(data => {
      this.terminology['children'] = data.body || [];
      if (data.body?.length === 0) {
        this.terminology['hasChildren'] = false;
      }
    });

    this.resources.termRelationshipTypes.list(this.terminology.id).subscribe(data => this.relationshipTypes = data.body.items);

    this.sourceTerm = this.data.sourceTerm;
    this.targetTerm = this.data.targetTerm;

    this.formWithExistingTerm = this.formBuilder.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      sourceTerm: [this.data.sourceTerm.id, Validators.required],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      relationshipType: [this.data.relationshipType?.id, Validators.required],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      targetTerm: [this.data.targetTerm?.id, Validators.required]
    });

    this.formWithNewTerm = this.formBuilder.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      sourceTerm: [this.data.sourceTerm.id, Validators.required],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      relationshipType: [this.data.relationshipType?.id, Validators.required],
      targetTerm: this.formBuilder.group({
        // eslint-disable-next-line @typescript-eslint/unbound-method
        code: [this.data.code, Validators.required],
        // eslint-disable-next-line @typescript-eslint/unbound-method
        definition: [this.data.definition, Validators.required],
        description: [this.data.description]
      })
    });

    this.subscriptions.add(
      this._relationshipType.subscribe(rt => {
        if (rt?.id) {
          this.formWithExistingTerm.patchValue({relationshipType: rt.id});
          this.formWithNewTerm.patchValue({relationshipType: rt.id});
        }
      })
    );

    this.subscriptions.add(
      this._targetTerm.subscribe(term => {
        if (this.useExistingTerms && term?.id) {
          this.form.patchValue({targetTerm: term.id});
          if (this.form.controls.targetTerm.untouched) {
            this.form.controls.targetTerm.markAsTouched();
          }
        }
      })
    );

    this.subscriptions.add(
      this._useExistingTerms.subscribe(b => {
        if (b) {
          this.form = this.formWithExistingTerm;
        } else {
          this.form = this.formWithNewTerm;
        }
      })
    );

    this.subscriptions.add(
      this.formWithNewTerm.valueChanges.subscribe(() => {
        if (this.form.value.targetTerm?.code && this.form.value.targetTerm?.definition) {
            this.targetTerm = this.form.value.targetTerm;
        }
      })
    );
  }

  selectedTerm(term: TermDetail | TerminologyDetail) {
    if (term.domainType === CatalogueItemDomainType.Term && this.sourceTerm.id !== term.id) {
      this.targetTerm = (term as TermDetail);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.messageHandler.showError(`Form is incomplete: ${this.form.errors}`);
      return;
    }

    this.submitting = true;

    if (!this.useExistingTerms) {
      this.resources.terms.save(this.terminology.id, {
        domainType: CatalogueItemDomainType.Term,
        code: this.form.value.targetTerm.code,
        definition: this.form.value.targetTerm.definition,
        description: this.form.value.targetTerm.description
      }).subscribe((response: HttpResponse<TermDetail>) => {
        if (response.ok) {
          this.targetTerm = response.body;
          this.resources.terms.addTermRelationships(this.terminology.id, this.sourceTerm.id, {
            sourceTerm: this.sourceTerm.id,
            relationshipType: this.relationshipType.id,
            targetTerm: this.targetTerm.id
          }).subscribe(
            (trResponse: HttpResponse<TermRelationship>) => {
              if (trResponse.ok) {
                this.dialogRef.close(trResponse.body);
              } else {
                this.messageHandler.showWarning(trResponse.body);
              }
              this.submitting = false;
            },
            error => {
              this.messageHandler.showError(error);
              this.submitting = false;
            }
          );
        } else {
          this.messageHandler.showError('Unable to create new Term');
          this.submitting = false;
        }
      });
    } else {
      this.resources.terms.addTermRelationships(this.terminology.id, this.sourceTerm.id, {
        sourceTerm: this.sourceTerm.id,
        relationshipType: this.relationshipType.id,
        targetTerm: this.targetTerm.id
      }).subscribe(
        (response: HttpResponse<TermRelationship>) => {
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
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get relationshipTypes(): TermRelationshipType[] {
    return this._relationshipTypes.value;
  }

  set relationshipTypes(relationshipTypes: TermRelationshipType[]) {
    this._relationshipTypes.next(relationshipTypes);
  }

  get sourceTerm(): TermDetail {
    return this._sourceTerm.value;
  }

  set sourceTerm(term: TermDetail) {
    this._sourceTerm.next(term);
  }

  get relationshipType(): TermRelationshipType {
    return this._relationshipType.value;
  }

  set relationshipType(relationshipType: TermRelationshipType) {
    this._relationshipType.next(relationshipType);
  }

  get targetTerm(): TermDetail {
    return this._targetTerm.value;
  }

  set targetTerm(term: TermDetail) {
    this._targetTerm.next(term);
  }

  get useExistingTerms(): boolean {
    return this._useExistingTerms.value;
  }

  set useExistingTerms(useExistingTerm: boolean) {
    this._useExistingTerms.next(useExistingTerm);
  }

}
