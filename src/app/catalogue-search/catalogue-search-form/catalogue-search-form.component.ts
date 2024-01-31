/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { FormControl, FormGroup } from '@angular/forms';
import { MatLegacyFormFieldAppearance as MatFormFieldAppearance } from '@angular/material/legacy-form-field';
import { Subject, takeUntil } from 'rxjs';

/**
 * Top-level component that represents the overall Catalogue Search page.
 *
 * This acts as the landing page to the catalogue search, holding just the form for
 * entering search criteria.
 */
@Component({
  selector: 'mdm-catalogue-search-form',
  templateUrl: './catalogue-search-form.component.html',
  styleUrls: ['./catalogue-search-form.component.scss']
})
export class CatalogueSearchFormComponent implements OnInit, OnDestroy {
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() routeSearchTerm?: string = '';

  @Output() valueChange = new EventEmitter<void>();
  @Output() searchEvent = new EventEmitter<string>();

  formGroup = new FormGroup({
    searchTerms: new FormControl(this.routeSearchTerm)
  });

  private unsubscribe$ = new Subject<void>();

  get searchTerms() {
    return this.formGroup.controls.searchTerms;
  }

  ngOnInit(): void {
    this.searchTerms.setValue(this.routeSearchTerm);

    this.formGroup.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.valueChange.emit());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  reset() {
    this.searchTerms.reset();
  }

  callParentSearch() {
    this.searchEvent.emit('formCallSearch');
  }
}
