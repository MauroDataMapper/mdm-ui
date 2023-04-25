import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CatalogueSearchProfileFilterListComponent } from '../catalogue-search-profile-filter-list/catalogue-search-profile-filter-list.component';

@Component({
  selector: 'mdm-profile-filter-dialog-component',
  templateUrl: './profile-filter-dialog-component.component.html',
  styleUrls: ['./profile-filter-dialog-component.component.scss']
})
export class ProfileFilterDialogComponent {
  @ViewChild(CatalogueSearchProfileFilterListComponent)
  profileFiltersForm: CatalogueSearchProfileFilterListComponent;

  constructor(
    public dialogRef: MatDialogRef<ProfileFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { profileFilters: any }
  ) {}

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    const filters = this.profileFiltersForm.mapToProfileFilters();
    this.dialogRef.close(filters);
  }
}
