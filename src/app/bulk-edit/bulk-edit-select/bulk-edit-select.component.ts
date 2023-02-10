/*
Copyright 2020-2023 University of Oxford
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
import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectionListChange } from '@angular/material/list';
import {
  CatalogueItemDomainType,
  FilterQueryParameters,
  MdmIndexResponse,
  ProfileSummary,
  TermIndexResponse
} from '@maurodatamapper/mdm-resources';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { BulkEditProfileService } from '../bulk-edit-profile.service';
import { BulkEditContext } from '../bulk-edit.types';

interface CatalogueItemDomainTypeOption {
  domainType: CatalogueItemDomainType;
  displayName: string;
}

@Component({
  selector: 'mdm-bulk-edit-select',
  templateUrl: './bulk-edit-select.component.html',
  styleUrls: ['./bulk-edit-select.component.scss']
})
export class BulkEditSelectComponent implements OnInit, OnDestroy {
  @Output() cancel = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  /** Two way binding */
  @Input() context: BulkEditContext;
  @Output() contextChanged = new EventEmitter<BulkEditContext>();

  childDomainTypeOptions: CatalogueItemDomainTypeOption[] = [];
  availableProfiles: ProfileSummary[] = [];
  availableChildItems: MauroItem[] = [];
  filteredChildItems: MauroItem[] = [];
  loading = false;

  // Using the cdkVirtualScrollViewport directive means we need to manually
  // keep track of child items selected
  childItemSelections = new SelectionModel<MauroItem>(true);

  setupForm = new FormGroup({
    childDomainType: new FormControl(null, Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
    childItems: new FormControl([], Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
    profiles: new FormControl([], Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
    filter: new FormControl(null)
  });

  private unsubscribe$ = new Subject<void>();

  get childDomainType() {
    return this.setupForm.get('childDomainType');
  }

  get childItems() {
    return this.setupForm.get('childItems');
  }

  get profiles() {
    return this.setupForm.get('profiles');
  }

  get filter() {
    return this.setupForm.get('filter');
  }

  get showBreadcrumbs() {
    return (
      this.context.childDomainType === CatalogueItemDomainType.DataClass ||
      this.context.childDomainType === CatalogueItemDomainType.DataElement
    );
  }

  constructor(
    private bulkEditProfiles: BulkEditProfileService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnInit(): void {
    this.resetContext();

    this.childDomainType.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((value: CatalogueItemDomainType) => {
          this.context.childDomainType = value;
          this.contextChanged.emit(this.context);

          return this.loadChildItems();
        }),
        switchMap((childItems) => {
          this.availableChildItems = childItems;
          this.filteredChildItems = this.availableChildItems;

          // Use first item to identify all available profiles
          const item = childItems[0];
          return this.loadAvailableProfiles(item);
        }),
        map((profiles) => (this.availableProfiles = profiles))
      )
      .subscribe(() => {
        // Subscribe to get notifications
      });

    this.childItems.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.context.childItems = value;
        this.contextChanged.emit(this.context);
      });

    this.profiles.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.context.profiles = value;
        this.contextChanged.emit(this.context);
      });

    this.filter.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(500),
        distinctUntilChanged(),
        map((value: string) =>
          this.availableChildItems.filter((item) =>
            item.label.toLowerCase().includes(value.toLowerCase())
          )
        )
      )
      .subscribe((filtered) => {
        this.filteredChildItems = filtered;
      });

    this.childDomainTypeOptions = this.getSuitableChildDomainTypes();
    if (this.childDomainTypeOptions.length === 1) {
      // Default to the first and only child domain type
      this.childDomainType.setValue(this.childDomainTypeOptions[0].domainType);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  profileCompare(option, value): boolean {
    return option.name === value.name && option.namespace === value.namespace;
  }

  onCancel() {
    this.cancel.emit();
  }

  onNext() {
    this.next.emit();
  }

  childItemSelected(selection: MatSelectionListChange) {
    selection.options.forEach((option) =>
      option.selected
        ? this.childItemSelections.select(option.value)
        : this.childItemSelections.deselect(option.value)
    );

    this.syncChildItemSelectionsWithForm();
  }

  selectAllChildItems() {
    this.childItemSelections.select(...this.availableChildItems);
    this.syncChildItemSelectionsWithForm();
  }

  deselectAllChildItems() {
    this.childItemSelections.clear();
    this.syncChildItemSelectionsWithForm();
  }

  private syncChildItemSelectionsWithForm() {
    this.childItems.setValue(this.childItemSelections.selected);
  }

  private resetContext() {
    this.context.childDomainType = null;
    this.context.childItems = [];
    this.context.profiles = [];
    this.contextChanged.emit(this.context);
  }

  private getSuitableChildDomainTypes(): CatalogueItemDomainTypeOption[] {
    if (
      this.context.rootItem.domainType === CatalogueItemDomainType.DataModel
    ) {
      return [
        {
          domainType: CatalogueItemDomainType.DataClass,
          displayName: 'Data Classes'
        },
        {
          domainType: CatalogueItemDomainType.DataElement,
          displayName: 'Data Elements'
        },
        {
          domainType: CatalogueItemDomainType.PrimitiveType,
          displayName: 'Data Types - Primitives'
        },
        {
          domainType: CatalogueItemDomainType.EnumerationType,
          displayName: 'Data Types - Enumerations'
        },
        {
          domainType: CatalogueItemDomainType.ModelDataType,
          displayName: 'Data Types - Models'
        }
      ];
    }

    if (
      this.context.rootItem.domainType === CatalogueItemDomainType.DataClass
    ) {
      return [
        {
          domainType: CatalogueItemDomainType.DataElement,
          displayName: 'Data Elements'
        }
      ];
    }

    if (
      this.context.rootItem.domainType ===
        CatalogueItemDomainType.Terminology ||
      this.context.rootItem.domainType === CatalogueItemDomainType.CodeSet
    ) {
      return [
        {
          domainType: CatalogueItemDomainType.Term,
          displayName: 'Terms'
        }
      ];
    }

    return [];
  }

  private loadChildItems(): Observable<MauroItem[]> {
    let request$: Observable<MdmIndexResponse<MauroItem>>;
    const filters: FilterQueryParameters = { all: true, sort: 'label' };

    if (this.context.childDomainType === CatalogueItemDomainType.DataElement) {
      request$ =
        this.context.rootItem.domainType === CatalogueItemDomainType.DataClass
          ? this.resources.dataElement.list(
              this.context.rootItem.model,
              this.context.rootItem.id,
              filters
            )
          : this.resources.dataModel.dataElements(
              this.context.rootItem.id,
              filters
            );
    } else if (
      this.context.childDomainType === CatalogueItemDomainType.DataClass
    ) {
      request$ = this.resources.dataClass.all(
        this.context.rootItem.id,
        filters
      );
    } else if (
      this.context.childDomainType === CatalogueItemDomainType.PrimitiveType ||
      this.context.childDomainType ===
        CatalogueItemDomainType.EnumerationType ||
      this.context.childDomainType === CatalogueItemDomainType.ModelDataType
    ) {
      const dataTypeFilters: FilterQueryParameters = {
        ...filters,
        domainType: this.context.childDomainType
      };
      request$ = this.resources.dataType.list(
        this.context.rootItem.id,
        dataTypeFilters
      );
    } else if (this.context.childDomainType === CatalogueItemDomainType.Term) {
      // This is a workaround for the fact that the `all` param doesn't work on Term lists
      // (a backend check to avoid huge term lists being processed). Basically do one request to get the total count,
      // then provide `max: count` to get one full page of results.  This isn't ideal and should be revisited at a
      // later date, but should work for now
      if (
        this.context.rootItem.domainType === CatalogueItemDomainType.CodeSet
      ) {
        request$ = this.resources.codeSet
          .terms(this.context.rootItem.id, { max: 1 })
          .pipe(
            switchMap((response: TermIndexResponse) =>
              this.resources.codeSet.terms(this.context.rootItem.id, {
                ...filters,
                max: response.body.count
              })
            )
          );
      } else {
        request$ = this.resources.term
          .list(this.context.rootItem.id, { max: 1 })
          .pipe(
            switchMap((response: TermIndexResponse) =>
              this.resources.term.list(this.context.rootItem.id, {
                ...filters,
                max: response.body.count
              })
            )
          );
      }
    } else {
      request$ = of({ body: { count: 0, items: [] } });
    }

    this.loading = true;
    return request$.pipe(
      catchError((error) => {
        this.messageHandler.showError(
          'There was a problem loading the requested child items.',
          error
        );
        return EMPTY;
      }),
      map((response) => response.body.items),
      finalize(() => (this.loading = false))
    );
  }

  private loadAvailableProfiles(item: MauroItem): Observable<ProfileSummary[]> {
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
