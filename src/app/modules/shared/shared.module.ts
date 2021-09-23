/*
Copyright 2020-2021 University of Oxford
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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableFormButtonsComponent } from '@mdm/utility/editable-form-buttons/editable-form-buttons.component';
import { FormsModule } from '@angular/forms';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { UIRouterModule } from '@uirouter/angular';
import { McSelectComponent } from '@mdm/utility/mc-select/mc-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { InlineTextEditComponent } from '@mdm/shared/inline-text-edit/inline-text-edit.component';
import { FooterComponent } from '@mdm/shared/footer/footer.component';
import { MetadataCompareComponent } from '@mdm/shared/metadata-compare/metadata-compare.component';
import { EnumerationCompareComponent } from '@mdm/shared/enumeration-compare/enumeration-compare.component';
import { MaterialModule } from '../material/material.module';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ErrorComponent } from '@mdm/errors/error.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { SafePipe } from '@mdm/pipes/safe.pipe';
import { ShareWithComponent } from '@mdm/access/share-with/share-with.component';
import { GroupAccessNewComponent } from '@mdm/access/group-access-new/group-access-new.component';
import { TextDiffComponent } from '@mdm/shared/text-diff/text-diff.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { DownloadLinkComponent } from '@mdm/utility/download-link/download-link.component';
import { NewVersionComponent } from '@mdm/shared/new-version/new-version.component';
import { AlertComponent } from '@mdm/shared/alert/alert.component';
import { BranchSelectorComponent } from '@mdm/shared/branch-selector/branch-selector.component';
import { ResizableDirective } from '@mdm/directives/resizable.directive';
import { DataTypeListButtonsComponent } from '@mdm/shared/data-type-list-buttons/data-type-list-buttons.component';
import { ModelIconComponent } from '@mdm/shared/model-icon/model-icon.component';
import { PathNameComponent } from '../../shared/path-name/path-name.component';
import { FavoriteButtonComponent } from '../../shared/favorite-button/favorite-button.component';
import { CatalogueItemPropertiesComponent } from '../../shared/catalogue-item-properties/catalogue-item-properties.component';

@NgModule({
  declarations: [
    EditableFormButtonsComponent,
    MoreDescriptionComponent,
    McSelectComponent,
    InlineTextEditComponent,
    FooterComponent,
    MetadataCompareComponent,
    EnumerationCompareComponent,
    ErrorComponent,
    MdmPaginatorComponent,
    SafePipe,
    ShareWithComponent,
    GroupAccessNewComponent,
    TextDiffComponent,
    ElementLinkComponent,
    DownloadLinkComponent,
    NewVersionComponent,
    AlertComponent,
    BranchSelectorComponent,
    ResizableDirective,
    DataTypeListButtonsComponent,
    ModelIconComponent,
    PathNameComponent,
    FavoriteButtonComponent,
    CatalogueItemPropertiesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    MatPasswordStrengthModule,
    NgxJsonViewerModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    NgxSkeletonLoaderModule,
    CodemirrorModule
  ],
  exports: [
    EditableFormButtonsComponent,
    FormsModule,
    MoreDescriptionComponent,
    UIRouterModule,
    MaterialModule,
    McSelectComponent,
    ReactiveFormsModule,
    MatPasswordStrengthModule,
    InlineTextEditComponent,
    FooterComponent,
    MetadataCompareComponent,
    EnumerationCompareComponent,
    NgxJsonViewerModule,
    ErrorComponent,
    FlexLayoutModule,
    MdmPaginatorComponent,
    NgxSkeletonLoaderModule,
    CodemirrorModule,
    SafePipe,
    ShareWithComponent,
    GroupAccessNewComponent,
    TextDiffComponent,
    ElementLinkComponent,
    TextDiffComponent,
    DownloadLinkComponent,
    NewVersionComponent,
    AlertComponent,
    BranchSelectorComponent,
    ResizableDirective,
    DataTypeListButtonsComponent,
    PathNameComponent,
    ModelIconComponent,
    FavoriteButtonComponent,
    CatalogueItemPropertiesComponent
  ]
})
export class SharedModule {}
