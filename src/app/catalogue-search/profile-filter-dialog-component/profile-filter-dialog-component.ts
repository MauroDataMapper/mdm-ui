/*
Copyright 2020-2023 University of Oxford and NHS England

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
