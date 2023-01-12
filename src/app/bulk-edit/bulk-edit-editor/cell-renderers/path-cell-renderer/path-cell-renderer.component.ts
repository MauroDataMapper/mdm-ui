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
import { Component } from '@angular/core';
import { NavigatableProfile } from '@mdm/mauro/mauro-item.types';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'mdm-path-cell-renderer',
  templateUrl: './path-cell-renderer.component.html',
  styleUrls: ['./path-cell-renderer.component.scss']
})
export class PathCellRendererComponent implements ICellRendererAngularComp {
  public profile: NavigatableProfile;
  public path = '';

  agInit(params: ICellRendererParams): void {
    this.profile = this.getProfile(params);
    this.path = this.getProfileBreadcrumbPath();
  }

  refresh(): boolean {
    // Let agGrid handle refresh
    return false;
  }

  getProfile(params: ICellRendererParams) {
    return params.data.profile;
  }

  getProfileBreadcrumbPath() {
    let builtPath = '';
    const numberOfBreadcrumbs = this.profile.breadcrumbs.length;

    this.profile.breadcrumbs.map((breadcrumb, i) => {
      if (i < numberOfBreadcrumbs && i !== 0) {
        builtPath = builtPath + ' > ';
      }
      builtPath = builtPath + breadcrumb.label;
    });
    return builtPath;
  }
}
