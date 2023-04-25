import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueSearchProfileFilter } from '../catalogue-search.types';

@Component({
  selector: 'mdm-profile-filters',
  templateUrl: './profile-filters.component.html',
  styleUrls: ['./profile-filters.component.scss']
})
export class ProfileFiltersComponent implements OnInit {
  @Input() profileFilters: CatalogueSearchProfileFilter[];
  @Output() updateProfileFilters = new EventEmitter<
    CatalogueSearchProfileFilter[]
  >();
  @Output() resetProfileFilters = new EventEmitter<void>();
  @Output() addProfileFilters = new EventEmitter<void>();
  constructor() {}

  ngOnInit(): void {}

  onAdd() {
    this.addProfileFilters.emit();
  }

  numberOfFilters() {
    return this.profileFilters.length ?? 0;
  }

  emitDeleteEvent(profileFilter: CatalogueSearchProfileFilter) {
    this.updateProfileFilters.emit(
      this.profileFilters.filter((filter) => {
        return filter.key !== profileFilter.key;
      })
    );
  }

  reset() {
    this.profileFilters = [];
    this.updateProfileFilters.emit(this.profileFilters);
  }
}
