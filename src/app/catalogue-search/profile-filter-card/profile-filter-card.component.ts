import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueSearchProfileFilter } from '../catalogue-search.types';

@Component({
  selector: 'mdm-profile-filter-card',
  templateUrl: './profile-filter-card.component.html',
  styleUrls: ['./profile-filter-card.component.scss']
})
export class ProfileFilterCardComponent implements OnInit {
  @Input() profileFilter: CatalogueSearchProfileFilter;
  @Output() delete = new EventEmitter<CatalogueSearchProfileFilter>();

  constructor() {}

  ngOnInit(): void {}

  onDelete() {
    this.delete.emit(this.profileFilter);
  }
}
