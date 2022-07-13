/*
Copyright 2020-2022 University of Oxford
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
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  CatalogueItem,
  DataElement,
  DataElementIndexResponse,
  ProfileSummary
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { BulkEditProfileService } from '../bulk-edit-profile.service';
import { BulkEditContext } from '../bulk-edit.types';

@Component({
  selector: 'mdm-bulk-edit-select',
  templateUrl: './bulk-edit-select.component.html',
  styleUrls: ['./bulk-edit-select.component.scss']
})
export class BulkEditSelectComponent implements OnInit, OnDestroy {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onNext = new EventEmitter<void>();

  /** Two way binding */
  @Input() context: BulkEditContext;
  @Output() contextChanged = new EventEmitter<BulkEditContext>();

  availableElements: DataElement[];
  availableProfiles: ProfileSummary[];
  setupForm: FormGroup;

  private unsubscribe$ = new Subject();

  get elements() {
    return this.setupForm.get('elements');
  }

  get profiles() {
    return this.setupForm.get('profiles');
  }

  constructor(
    private bulkEditProfiles: BulkEditProfileService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnInit(): void {
    this.setupForm = new FormGroup({
      elements: new FormControl(this.context.elements, Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
      profiles: new FormControl(this.context.profiles, Validators.required) // eslint-disable-line @typescript-eslint/unbound-method
    });

    this.elements.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.context.elements = val;
        this.contextChanged.emit(this.context);
      });

    this.profiles.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.context.profiles = val;
        this.contextChanged.emit(this.context);
      });

    this.loadAvailableElements()
      .pipe(
        switchMap((elements) => {
          this.availableElements = elements.body.items;

          // Load correct profiles based on Data Elements
          // TODO: change for future domain type support
          const dataElement = this.availableElements[0];
          return this.loadAvailableProfiles(dataElement);
        }),
        map((profiles) => {
          this.availableProfiles = profiles;
        })
      )
      .subscribe(() => {
        // Subscribe to perform the request
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
      .dataElements(this.context.rootItem.id, { all: true })
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem finding the Data Elements.',
            error
          );
          return EMPTY;
        })
      );
  }

  private loadAvailableProfiles(
    item: CatalogueItem
  ): Observable<ProfileSummary[]> {
    return this.bulkEditProfiles.listAvailableProfiles(item).pipe(
      catchError((error) => {
        this.messageHandler.showError(
          'There was a problem finding available profiles.',
          error
        );
        return EMPTY;
      })
    );
  }
}
