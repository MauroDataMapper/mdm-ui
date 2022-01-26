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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CatalogueItem, DataElement, DataElementIndexResponse, ProfileSummary, ProfileSummaryIndexResponse } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BulkEditContext } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-select',
  templateUrl: './bulk-edit-select.component.html',
  styleUrls: ['./bulk-edit-select.component.scss']
})
export class BulkEditSelectComponent implements OnInit {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onNext = new EventEmitter<void>();

  /** Two way binding */
  @Input() context: BulkEditContext;
  @Output() contextChanged = new EventEmitter<BulkEditContext>();

  availableElements: DataElement[];
  availableProfiles: ProfileSummary[];
  setupForm: FormGroup;

  get elements() {
    return this.setupForm.get('elements');
  }

  get profiles() {
    return this.setupForm.get('profiles');
  }

  constructor(
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService) { }

  ngOnInit(): void {
    this.setupForm = new FormGroup({
      elements: new FormControl('', Validators.required),  // eslint-disable-line @typescript-eslint/unbound-method
      profiles: new FormControl('', Validators.required)   // eslint-disable-line @typescript-eslint/unbound-method
    });

    this.loadAvailableElements()
      .pipe(
        switchMap(elements => {
          this.availableElements = elements.body.items;

          const dataElement = this.availableElements[0];
          return this.loadAvailableProfiles(dataElement);
        }),
        map(([used, unused]) => {
          this.availableProfiles = [
            ...used.body,
            ...unused.body
          ];
        })
      )
      .subscribe(() => {
        // Subscribe to perform the request
      });
  }

  elementCompare(option, value): boolean {
    return option.id === value.id;
  }

  profileCompare(option, value): boolean {
    return option.name === value.name && option.namespace === value.namespace;
  }

  cancel() {
    this.onCancel.emit();
  }

  next() {
    this.onNext.emit();
  }

  private loadAvailableElements(): Observable<DataElementIndexResponse> {
    return this.resources.dataModel
      .dataElements(this.context.catalogueItemId)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem finding the Data Elements.', error);
          return EMPTY;
        })
      );
  }

  private loadAvailableProfiles(catalogueItem: CatalogueItem): Observable<[ProfileSummaryIndexResponse, ProfileSummaryIndexResponse]> {
    // Load correct profiles based on Data Elements
    // TODO: change for future domain type support
    return forkJoin<ProfileSummaryIndexResponse, ProfileSummaryIndexResponse>([
      this.resources.profile.usedProfiles(catalogueItem.domainType, catalogueItem.id),
      this.resources.profile.unusedProfiles(catalogueItem.domainType, catalogueItem.id)
    ])
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem finding available profiles.', error);
          return EMPTY;
        })
      );
  }
}
