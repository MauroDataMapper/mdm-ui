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
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MdmResourcesService } from '@mdm/modules/resources';
import { CatalogueItemDomainType, ContainerDomainType, ModelDomainType, TermDetail, TerminologyDetail, TermRelationship, TermRelationshipType } from '@maurodatamapper/mdm-resources';
import { MessageHandlerService } from '@mdm/services';
import { BehaviorSubject, EMPTY, Subscription } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'mdm-create-term-relationship-dialog',
  templateUrl: 'create-term-relationship-dialog.component.html',
  styleUrls: ['create-term-relationship-dialog.component.scss']
})
export class CreateTermRelationshipDialogComponent implements OnInit, OnDestroy {

  // Form instance holder
  form: FormGroup;

  // Form instance for creating relationship with existing term
  formWithExistingTerm: FormGroup;

  // Form instance for creating relationship with new term
  formWithNewTerm: FormGroup;

  // Terminology the terms and relationship belong to
  terminology: TerminologyDetail;

  submitting = false;

  private subscriptions = new Subscription();
  private _sourceTerm = new BehaviorSubject<TermDetail>(null);
  private _relationshipType = new BehaviorSubject<TermRelationshipType>(null);
  private _targetTerm = new BehaviorSubject<TermDetail>(null);

  // The types of relationships available
  private _relationshipTypes = new BehaviorSubject<TermRelationshipType[]>([]);

  // Keep track of whether need to create new term, or use existing ones, for the relationship.
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
      this._useExistingTerms.subscribe(useExistingTerms => {
        if (useExistingTerms) {
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
      // Create the new term first
      this.resources.terms.save(this.terminology.id, {
        domainType: CatalogueItemDomainType.Term,
        code: this.form.value.targetTerm.code,
        definition: this.form.value.targetTerm.definition,
        description: this.form.value.targetTerm.description
      }).pipe(
        catchError(error => {
          this.messageHandler.showError('Unable to create new term');
          console.error(error);
          return EMPTY;
        }),
        finalize(() => this.submitting = false)
      ).subscribe((response: HttpResponse<TermDetail>) => {
        if (response.ok) {
          this.targetTerm = response.body;

          // New term created. Now add the new relationship.
          this.resources.terms.addTermRelationships(this.terminology.id, this.sourceTerm.id, {
            sourceTerm: this.sourceTerm.id,
            relationshipType: this.relationshipType.id,
            targetTerm: this.targetTerm.id
          }).pipe(
            catchError(error => {
              this.messageHandler.showError('Unable to create new relationship');
              console.error(error);
              return EMPTY;
            }),
            finalize(() => this.submitting = false)
          ).subscribe((trResponse: HttpResponse<TermRelationship>) => {
              if (trResponse.ok) {
                this.dialogRef.close(trResponse.body);
              } else {
                this.messageHandler.showWarning(trResponse.body);
              }
            }
          );
        } else {
          this.messageHandler.showWarning(response.body);
        }
      });
    } else {
      this.resources.terms.addTermRelationships(this.terminology.id, this.sourceTerm.id, {
        sourceTerm: this.sourceTerm.id,
        relationshipType: this.relationshipType.id,
        targetTerm: this.targetTerm.id
      }).pipe(
        catchError(error => {
          this.messageHandler.showError('Unable to create new relationship');
          console.error(error);
          return EMPTY;
        }),
        finalize(() => this.submitting = false)
      ).subscribe(
        (response: HttpResponse<TermRelationship>) => {
          if (response.ok) {
            this.dialogRef.close(response.body);
          } else {
            this.messageHandler.showWarning(response.body);
          }
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
