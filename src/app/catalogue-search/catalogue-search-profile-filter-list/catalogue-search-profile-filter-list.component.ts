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
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ProfileDefinition,
  ProfileDefinitionResponse,
  ProfileField,
  ProfileSummary,
  ProfileSummaryIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { map, Subject, switchMap, takeUntil } from 'rxjs';
import { CatalogueSearchProfileFilter } from '../catalogue-search.types';

@Component({
  selector: 'mdm-catalogue-search-profile-filter-list',
  templateUrl: './catalogue-search-profile-filter-list.component.html',
  styleUrls: ['./catalogue-search-profile-filter-list.component.scss']
})
export class CatalogueSearchProfileFilterListComponent
  implements OnInit, OnDestroy {
  @Input() prefilledFilters?: CatalogueSearchProfileFilter[];
  @Output() valueChange = new EventEmitter<void>();

  /**
   * Maximum number of filters allowed.
   */
  readonly max = 5;

  providers: ProfileSummary[] = [];
  formGroup = new FormGroup({
    filters: new FormArray([])
  });

  private unsubscribe$ = new Subject<void>();

  constructor(private resources: MdmResourcesService) {}

  get filters() {
    return this.formGroup.controls.filters;
  }

  ngOnInit(): void {
    this.resources.profile
      .providers({ latestVersionByMetadataNamespace: true })
      .pipe(
        map((response: ProfileSummaryIndexResponse) =>
          response.body.sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
          )
        )
      )
      .subscribe((providers: ProfileSummary[]) => (this.providers = providers));

    if (this.prefilledFilters) {
      this.prefilledFilters.forEach((filter: CatalogueSearchProfileFilter) => {
        this.filters.push(this.createFilter(filter));
      });
    }

    this.formGroup.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.valueChange.emit());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addFilter() {
    if (this.filters.length >= this.max) {
      return;
    }

    this.filters.push(this.createFilter());
  }

  removeFilter(index: number) {
    this.filters.removeAt(index);
  }

  reset() {
    this.filters.clear();
  }

  mapToProfileFilters(): CatalogueSearchProfileFilter[] | undefined {
    if (this.formGroup.invalid || this.filters.length === 0) {
      return undefined;
    }

    return this.filters.controls.map(
      (
        row: FormGroup<{
          provider: FormControl<ProfileSummary>;
          key: FormControl<ProfileField>;
          value: FormControl<string>;
        }>
      ) => {
        return {
          provider: row.controls.provider.value,
          key: row.controls.key.value,
          value: row.controls.value.value
        };
      }
    );
  }

  setInitialDefinitionValue(row: FormGroup, provider: ProfileSummary): void {
    this.resources.profile
      .definition(provider.namespace, provider.name)
      .subscribe((response: ProfileDefinitionResponse) => {
        const definition = response.body;
        row.controls.definition.setValue(definition);
      });
  }

  compareProviders(a: ProfileSummary, b: ProfileSummary) {
    return a.namespace === b.namespace && a.name === b.name;
  }

  compareKeys(a: ProfileSummary, b: ProfileSummary) {
    return (
      a.metadataPropertyName === b.metadataPropertyName &&
      a.description === b.description
    );
  }

  private createFilter(profileFilter?: CatalogueSearchProfileFilter) {
    /* eslint-disable @typescript-eslint/unbound-method */

    const filter = new FormGroup({
      // Important fields required for search filters
      provider: new FormControl<ProfileSummary>(
        profileFilter?.provider ?? null,
        Validators.required
      ),
      key: new FormControl<ProfileField>(
        profileFilter?.key ?? null,
        Validators.required
      ),
      value: new FormControl(profileFilter?.value ?? '', Validators.required),

      // Non-visible form controls, required as dependencies to above
      definition: new FormControl<ProfileDefinition>(null)
    });

    /* eslint-enable @typescript-eslint/unbound-method */

    // Track when the "provider" field changes, then fetch that profile definition
    // to be able to select from the list of known fields. Set the definition to a
    // special "backing" field for this form group, this will be used to render the key
    // options to the mat-select in this row
    if (profileFilter) {
      this.setInitialDefinitionValue(filter, profileFilter.provider);
    }

    filter.controls.provider.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((provider) =>
          this.resources.profile.definition(provider.namespace, provider.name)
        ),
        map((response: ProfileDefinitionResponse) => response.body)
      )
      .subscribe((definition) =>
        filter.controls.definition.setValue(definition)
      );

    // When the provider changes, reset any previous key/value set
    // Use reset() instead of setValue() so that dirty/pristine state is reset too
    filter.controls.provider.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        filter.controls.key.reset();
        filter.controls.value.reset();
      });

    // When the key changes, reset any previous value set
    // Use reset() instead of setValue() so that dirty/pristine state is reset too
    filter.controls.key.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        filter.controls.value.reset();
      });

    return filter;
  }
}
