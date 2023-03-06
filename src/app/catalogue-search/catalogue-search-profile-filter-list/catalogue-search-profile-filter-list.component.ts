import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
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

@Component({
  selector: 'mdm-catalogue-search-profile-filter-list',
  templateUrl: './catalogue-search-profile-filter-list.component.html',
  styleUrls: ['./catalogue-search-profile-filter-list.component.scss']
})
export class CatalogueSearchProfileFilterListComponent
  implements OnInit, OnDestroy {
  @Output() valueChange = new EventEmitter<void>();

  providers: ProfileSummary[] = [];
  formGroup = new FormGroup({
    filters: new FormArray([])
  });

  private unsubscribe$ = new Subject<void>();

  get filters() {
    return this.formGroup.controls.filters;
  }

  constructor(private resources: MdmResourcesService) {}

  ngOnInit(): void {
    this.resources.profile
      .providers()
      .pipe(
        map((response: ProfileSummaryIndexResponse) =>
          response.body.sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
          )
        )
      )
      .subscribe((providers: ProfileSummary[]) => (this.providers = providers));

    this.formGroup.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.valueChange.emit());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addFilter() {
    this.filters.push(this.createFilter());
  }

  removeFilter(index: number) {
    this.filters.removeAt(index);
  }

  reset() {
    this.filters.clear();
  }

  private createFilter() {
    const filter = new FormGroup({
      // Important fields required for search filters
      provider: new FormControl<ProfileSummary>(null, Validators.required),
      key: new FormControl<ProfileField>(null, Validators.required),
      value: new FormControl('', Validators.required),

      // Non-visible form controls, required as dependencies to above
      definition: new FormControl<ProfileDefinition>(null)
    });

    // Track when the "provider" field changes, then fetch that profile definition
    // to be able to select from the list of known fields. Set the definition to a
    // special "backing" field for this form group, this will be used to render the key
    // options to the mat-select in this row
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
