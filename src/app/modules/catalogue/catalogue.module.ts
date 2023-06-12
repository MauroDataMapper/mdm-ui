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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { AdminModule } from '../admin/admin.module';
import { SharedModule } from '@mdm/shared/shared.module';
import { UsersModule } from '../users/users.module';
import { FolderComponent } from '@mdm/folder/folder.component';
import { ExportModelsComponent } from '@mdm/export-models/export-models.component';

import { HistoryComponent } from '@mdm/shared/history/history.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { ElementSelectorComponent } from '@mdm/utility/element-selector.component';
import { NotFoundComponent } from '@mdm/errors/not-found/not-found.component';
import { DataModelDefaultComponent } from '@mdm/utility/data-model-default.component';
import { ServerErrorComponent } from '@mdm/errors/server-error/server-error.component';
import { NotImplementedComponent } from '@mdm/errors/not-implemented/not-implemented.component';
import { NotAuthorizedComponent } from '@mdm/errors/not-authorized/not-authorized.component';
import { DataModelComponent } from '@mdm/dataModel/data-model.component';
import { McDataSetMetadataComponent } from '@mdm/shared/mc-data-set-metadata/mc-data-set-metadata.component';
import { TableButtonsComponent } from '@mdm/shared/table-buttons/table-buttons.component';
import { AnnotationListComponent } from '@mdm/shared/annotation-list/annotation-list.component';
import { ProfilePictureComponent } from '@mdm/shared/profile-picture/profile-picture.component';
import { ElementOwnedDataTypeListComponent } from '@mdm/shared/element-owned-data-type-list/element-owned-data-type-list.component';
import { ElementChildDataClassesListComponent } from '@mdm/shared/element-child-data-classes-list/element-child-data-classes-list.component';
import { ElementStatusComponent } from '@mdm/utility/element-status/element-status.component';
import { ElementClassificationsComponent } from '@mdm/utility/element-classifications/element-classifications.component';
import { ElementAliasComponent } from '@mdm/utility/element-alias/element-alias.component';
import { PropertiesDirective } from '@mdm/directives/properties.directive';
import { ElementDataTypeComponent } from '@mdm/shared/element-data-type/element-data-type.component';
import { MultiplicityComponent } from '@mdm/shared/multiplicity/multiplicity.component';
import { ElementLinkListComponent } from '@mdm/shared/element-link-list/element-link-list.component';
import { AttachmentListComponent } from '@mdm/shared/attachment-list/attachment-list.component';
import { SummaryMetadataTableComponent } from '@mdm/shared/summary-metadata/summary-metadata-table/summary-metadata-table.component';
import { SummaryMetadataChartComponent } from '@mdm/shared/summary-metadata/summary-metadata-chart/summary-metadata-chart.component';

import { DataClassComponent } from '@mdm/dataClass/data-class/data-class.component';
import { ShowIfRolesWritableDirective } from '@mdm/directives/show-if-roles-writable.directive';
import { DataModelMainComponent } from '@mdm/wizards/dataModel/data-model-main/data-model-main.component';
import { DclWrapperComponent } from '@mdm/wizards/dcl-wrapper.component';
import { DataModelStep1Component } from '@mdm/wizards/dataModel/data-model-step1/data-model-step1.component';
import { DataModelStep2Component } from '@mdm/wizards/dataModel/data-model-step2/data-model-step2.component';
import { DataClassMainComponent } from '@mdm/wizards/dataClass/data-class-main/data-class-main.component';
import { DataClassStep1Component } from '@mdm/wizards/dataClass/data-class-step1/data-class-step1.component';
import { DataClassStep2Component } from '@mdm/wizards/dataClass/data-class-step2/data-class-step2.component';
import { DataTypeMainComponent } from '@mdm/wizards/dataType/data-type-main/data-type-main.component';
import { DataTypeStep1Component } from '@mdm/wizards/dataType/data-type-step1/data-type-step1.component';
import { DataTypeStep2Component } from '@mdm/wizards/dataType/data-type-step2/data-type-step2.component';
import { AllLinksInPagedListComponent } from '@mdm/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { ConfigurationComponent } from '@mdm/admin/configuration/configuration.component';
import { UsersComponent } from '@mdm/admin/users/users.component';
import { UsersTableComponent } from '@mdm/admin/users-table/users-table.component';
import { GroupsComponent } from '@mdm/admin/groups/groups.component';
import { GroupsTableComponent } from '@mdm/admin/groups-table/groups-table.component';
import { PendingUsersComponent } from '@mdm/admin/pending-users/pending-users.component';
import { PendingUsersTableComponent } from '@mdm/admin/pending-users-table/pending-users-table.component';
import { SubscribedCatalogueComponent } from '@mdm/admin/subscribed-catalogue/subscribed-catalogue.component';
import { SubscribedCataloguesComponent } from '@mdm/admin/subscribed-catalogues/subscribed-catalogues.component';
import { DashboardComponent } from '@mdm/admin/home/home.component';
import { ModulesComponent } from '@mdm/admin/home/modules/modules.component';
import { PluginsComponent } from '@mdm/admin/home/plugins/plugins.component';
import { ActiveSessionsComponent } from '@mdm/admin/home/active-sessions/active-sessions.component';
import { ModelManagementComponent } from '@mdm/admin/model-management/model-management.component';
import { DataElementComponent } from '@mdm/dataElement/data-element/data-element.component';
import { NewDataTypeInlineComponent } from '@mdm/utility/new-data-type-inline/new-data-type-inline.component';
import { DataElementMainComponent } from '@mdm/wizards/dataElement/data-element-main/data-element-main.component';
import { DataElementStep1Component } from '@mdm/wizards/dataElement/data-element-step1/data-element-step1.component';
import { DataElementStep2Component } from '@mdm/wizards/dataElement/data-element-step2/data-element-step2.component';
import { HomeComponent } from '@mdm/home/home.component';
import { ImportModelsComponent } from '@mdm/import-models/import-models.component';
import { TerminologyComponent } from '@mdm/terminology/terminology.component';
import { TermListComponent } from '@mdm/terminology/term-list/term-list.component';
import { CreateTermDialogComponent } from '@mdm/terminology/term-list/create-term-dialog/create-term-dialog.component';
import { TwoSidePanelComponent } from '@mdm/two-side-panel/two-side-panel.component';
import { UiViewComponent } from '@mdm/shared/ui-view/ui-view.component';
import { ModelsComponent } from '@mdm/shared/models/models.component';
import { FavouritesComponent } from '@mdm/shared/favourites/favourites.component';
import { ShowIfRoleIsWritableDirective } from '@mdm/directives/show-if-role-is-writable.directive';
import { McEnumerationListWithCategoryComponent } from '@mdm/utility/mc-enumeration-list-with-category/mc-enumeration-list-with-category.component';
import { ClassificationComponent } from '@mdm/classification/classification.component';
import { ClassifiedElementsListComponent } from '@mdm/shared/classified-elements-list/classified-elements-list.component';
import { AppContainerComponent } from '@mdm/app-container/app-container.component';
import { NavbarComponent } from '@mdm/navbar/navbar.component';
import { CapitalizePipe } from '@mdm/pipes/capitalize.pipe';
import { FilterPipe } from '@mdm/directives/filter-pipe.directive';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { GroupComponent } from '@mdm/admin/group/group.component';
import { DataTypeComponent } from '@mdm/data-type/data-type.component';
import { ElementChildDataElementsListComponent } from '@mdm/shared/element-child-data-elements-list/element-child-data-elements-list.component';
import { SettingsComponent } from '@mdm/userArea/settings/settings.component';
import { AboutComponent } from '@mdm/about/about.component';
import { ResetPasswordComponent } from '@mdm/reset-password/reset-password.component';
import { TermComponent } from '@mdm/term/term/term.component';
import { TermRelationshipsComponent } from '@mdm/utility/term-relationships/term-relationships.component';
import { LinkSuggestionComponent } from '@mdm/link-suggestion/link-suggestion.component';
import { ModelComparisonComponent } from '@mdm/model-comparison/model-comparison.component';
import { CodeSetMainComponent } from '@mdm/wizards/codeSet/code-set-main/code-set-main.component';
import { MultipleTermsSelectorComponent } from '@mdm/utility/multiple-terms-selector/multiple-terms-selector.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrModule } from 'ngx-toastr';
import { NgChartsModule } from 'ng2-charts';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AngularSplitModule } from 'angular-split';
import { CodeSetComponent } from '@mdm/code-set/code-set/code-set.component';
import { CodeSetTermsTableComponent } from '@mdm/shared/code-set-terms-table/code-set-terms-table.component';
import { DiagramTabComponent } from '@mdm/diagram/diagram-tab/diagram-tab.component';
import { DiagramPopupComponent } from '@mdm/diagram/diagram-popup/diagram-popup.component';
import { DiagramComponent } from '@mdm/diagram/diagram/diagram.component';
import { DiagramToolbarComponent } from '@mdm/diagram/diagram-toolbar/diagram-toolbar.component';
import { SummaryMetadataPopupComponent } from '@mdm/shared/summary-metadata/summary-metadata-popup/summary-metadata-popup.component';
import { MatTabsModule } from '@angular/material/tabs';
import { BulkEditModalComponent } from '@mdm/modals/bulk-edit-modal/bulk-edit-modal.component';
import { BulkDeleteModalComponent } from '@mdm/modals/bulk-delete-modal/bulk-delete-modal.component';
import { ModelsMergingGraphComponent } from '@mdm/models-merging-graph/models-merging-graph.component';
import { VersioningGraphModalComponent } from '@mdm/modals/versioning-graph-modal/versioning-graph-modal.component';
import { ReferenceDataComponent } from '@mdm/referenceData/reference-data.component';
import { ReferenceDataTypeComponent } from '@mdm/referenceData/reference-data-type/reference-data-type.component';
import { ReferenceDataElementComponent } from '@mdm/referenceData/reference-data-element/reference-data-element.component';
import { ReferenceDataValuesComponent } from '@mdm/referenceData/reference-data-values/reference-data-values.component';
import { BaseComponent } from '@mdm/shared/base/base.component';
import { LoadingIndicatorComponent } from '@mdm/utility/loading-indicator/loading-indicator.component';

import { SubscribedCatalogueMainComponent } from '@mdm/subscribed-catalogues/subscribed-catalogue-main/subscribed-catalogue-main.component';
import { SubscribedCatalogueDetailComponent } from '@mdm/subscribed-catalogues/subscribed-catalogue-detail/subscribed-catalogue-detail.component';
import { FederatedDataModelMainComponent } from '@mdm/subscribed-catalogues/federated-data-model-main/federated-data-model-main.component';
import { FederatedDataModelDetailComponent } from '@mdm/subscribed-catalogues/federated-data-model-detail/federated-data-model-detail.component';
import { NewFederatedSubscriptionModalComponent } from '@mdm/subscribed-catalogues/new-federated-subscription-modal/new-federated-subscription-modal.component';
import { EnumerationValuesComponent } from '@mdm/enumerationValues/enumeration-values/enumeration-values.component';
import { EnumerationValuesDetailsComponent } from '@mdm/enumerationValues/enumeration-values-details/enumeration-values-details.component';
import { ConstraintsRulesComponent } from '@mdm/constraints-rules/constraints-rules.component';
import { ApiPropertyTableComponent } from '@mdm/admin/api-property-table/api-property-table.component';
import { ApiPropertyComponent } from '@mdm/admin/api-property/api-property.component';
import { ProfileDetailsComponent } from '@mdm/shared/profile-details/profile-details.component';
import { ServerTimeoutComponent } from '@mdm/errors/server-timeout/server-timeout.component';
import { VersionedFolderComponent } from '@mdm/versioned-folder/versioned-folder/versioned-folder.component';
import { DefaultProfileComponent } from '@mdm/shared/default-profile/default-profile.component';
import { PipesModule } from '../pipes/pipes.module';
import { OpenIdConnectAuthorizeComponent } from '@mdm/security/open-id-connect-authorize/open-id-connect-authorize.component';
import { ProfileDataViewComponent } from '@mdm/shared/profile-data-view/profile-data-view.component';
import { TermRelationshipTypeListComponent } from '@mdm/terminology/term-relationship-type-list/term-relationship-type-list.component';
import { TermCodeSetListComponent } from '@mdm/term/codeset-list/term-codeset-list.component';
import { CreateTermRelationshipTypeDialogComponent } from '@mdm/terminology/term-relationship-type-list/create-term-relationship-type-dialog/create-term-relationship-type-dialog.component';
import { TermRelationshipListComponent } from '@mdm/term/relationship-list/term-relationship-list.component';
import { CreateTermRelationshipDialogComponent } from '@mdm/term/create-term-relationship-dialog/create-term-relationship-dialog.component';
import { NewerVersionsComponent } from '@mdm/subscribed-catalogues/newer-versions/newer-versions.component';
import { BulkEditModule } from '@mdm/bulk-edit/bulk-edit.module';
import { TerminologyMainComponent } from '@mdm/wizards/terminology/terminology-main/terminology-main.component';
import { SkeletonBadgeComponent } from '@mdm/utility/skeleton-badge/skeleton-badge.component';
import { MoreDescriptionComponent } from '@mdm/shared/more-description/more-description.component';
import { CatalogueSearchModule } from '@mdm/catalogue-search/catalogue-search.module';
import { ReferenceDataTypeMainComponent } from '@mdm/wizards/referenceDataType/reference-data-type-main/reference-data-type-main.component';
import { ReferenceDataTypeStep1Component } from '@mdm/wizards/referenceDataType/reference-data-type-step1/reference-data-type-step1.component';
import { ReferenceDataTypeStep2Component } from '@mdm/wizards/referenceDataType/reference-data-type-step2/reference-data-type-step2.component';
import { NewReferenceDataTypeFormComponent } from '@mdm/wizards/referenceDataType/new-reference-data-type-form/new-reference-data-type-form.component';
import { ReferenceDataTypeSelectComponent } from '@mdm/wizards/referenceDataType/reference-data-type-select/reference-data-type-select.component';
import { ReferenceDataModelMainComponent } from '@mdm/wizards/referenceDataModel/reference-data-model-main/reference-data-model-main.component';
import { ModelHeaderComponent } from '@mdm/model-header/model-header.component';
import { USER_IDLE_CONFIGURATION } from '@mdm/external/user-idle/user-idle.service';
import { DataClassComponentsListComponent } from '@mdm/shared/data-class-components-list/data-class-components-list.component';

@NgModule({
  providers: [
    {
      provide: USER_IDLE_CONFIGURATION,
      // Default values: `idle` is 600 (10 minutes), `timeout` is 300 (5 minutes)
      useValue: {
        idle: 600,
        timeout: 300,
      },
    },
  ],
  declarations: [
    FolderComponent,
    ExportModelsComponent,
    DiagramComponent,
    DiagramTabComponent,
    DiagramPopupComponent,
    DiagramToolbarComponent,
    HistoryComponent,
    ModelPathComponent,
    ElementSelectorComponent,
    ModelPathComponent,
    NotFoundComponent,
    DataModelDefaultComponent,
    ServerErrorComponent,
    ServerTimeoutComponent,
    NotImplementedComponent,
    NotAuthorizedComponent,
    DataModelComponent,
    McDataSetMetadataComponent,
    TableButtonsComponent,
    AnnotationListComponent,
    ProfilePictureComponent,
    SummaryMetadataTableComponent,
    SummaryMetadataChartComponent,
    SummaryMetadataPopupComponent,
    ElementOwnedDataTypeListComponent,
    ElementChildDataClassesListComponent,
    McDataSetMetadataComponent,
    ElementStatusComponent,
    ElementClassificationsComponent,
    ElementAliasComponent,
    PropertiesDirective,
    ElementDataTypeComponent,
    MultiplicityComponent,
    ElementLinkListComponent,
    AttachmentListComponent,
    DataClassComponent,
    ShowIfRolesWritableDirective,
    DataModelMainComponent,
    DclWrapperComponent,
    DataModelStep1Component,
    DataModelStep2Component,
    DataClassMainComponent,
    DataClassStep1Component,
    DataClassStep2Component,
    DataTypeMainComponent,
    DataTypeStep1Component,
    DataTypeStep2Component,
    DataClassComponentsListComponent,
    AllLinksInPagedListComponent,
    McPagedListComponent,
    ConfigurationComponent,
    UsersComponent,
    UsersTableComponent,
    GroupsComponent,
    GroupsTableComponent,
    PendingUsersComponent,
    PendingUsersTableComponent,
    SubscribedCatalogueComponent,
    SubscribedCataloguesComponent,
    DashboardComponent,
    ModulesComponent,
    PluginsComponent,
    ActiveSessionsComponent,
    ModelManagementComponent,
    DataElementComponent,
    NewDataTypeInlineComponent,
    DataElementMainComponent,
    DataElementStep1Component,
    DataElementStep2Component,
    HomeComponent,
    ImportModelsComponent,
    TerminologyComponent,
    TermListComponent,
    TermRelationshipTypeListComponent,
    TermCodeSetListComponent,
    CreateTermDialogComponent,
    CreateTermRelationshipTypeDialogComponent,
    CreateTermRelationshipDialogComponent,
    TwoSidePanelComponent,
    UiViewComponent,
    ModelsComponent,
    FavouritesComponent,
    ShowIfRoleIsWritableDirective,
    McEnumerationListWithCategoryComponent,
    ClassificationComponent,
    ClassifiedElementsListComponent,
    AppContainerComponent,
    NavbarComponent,
    CapitalizePipe,
    FilterPipe,
    ByteArrayToBase64Pipe,
    GroupComponent,
    DataTypeComponent,
    ElementChildDataElementsListComponent,
    SettingsComponent,
    AboutComponent,
    ResetPasswordComponent,
    TermComponent,
    TermRelationshipsComponent,
    ByteArrayToBase64Pipe,
    SettingsComponent,
    LinkSuggestionComponent,
    ModelComparisonComponent,
    CodeSetMainComponent,
    MultipleTermsSelectorComponent,
    CodeSetComponent,
    CodeSetTermsTableComponent,
    BulkEditModalComponent,
    BulkDeleteModalComponent,
    ModelsMergingGraphComponent,
    VersioningGraphModalComponent,
    BulkDeleteModalComponent,
    ReferenceDataComponent,
    BaseComponent,
    ReferenceDataTypeComponent,
    ReferenceDataElementComponent,
    ReferenceDataValuesComponent,
    EnumerationValuesComponent,
    EnumerationValuesDetailsComponent,
    ConstraintsRulesComponent,
    LoadingIndicatorComponent,
    ApiPropertyTableComponent,
    ApiPropertyComponent,
    SubscribedCatalogueMainComponent,
    SubscribedCatalogueDetailComponent,
    FederatedDataModelMainComponent,
    FederatedDataModelDetailComponent,
    NewFederatedSubscriptionModalComponent,
    ApiPropertyComponent,
    SubscribedCatalogueMainComponent,
    SubscribedCatalogueDetailComponent,
    FederatedDataModelMainComponent,
    FederatedDataModelDetailComponent,
    ProfileDetailsComponent,
    VersionedFolderComponent,
    DefaultProfileComponent,
    OpenIdConnectAuthorizeComponent,
    ProfileDataViewComponent,
    TermRelationshipListComponent,
    NewerVersionsComponent,
    TerminologyMainComponent,
    SkeletonBadgeComponent,
    ReferenceDataModelMainComponent,
    ReferenceDataTypeMainComponent,
    ReferenceDataTypeStep1Component,
    ReferenceDataTypeStep2Component,
    NewReferenceDataTypeFormComponent,
    ReferenceDataTypeSelectComponent,
    ModelHeaderComponent
  ],
  imports: [
    AdminModule,
    AngularSplitModule.forRoot(),
    BulkEditModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgChartsModule,
    CommonModule,
    DragDropModule,
    FoldersTreeModule,
    FormsModule,
    HttpClientModule,
    ImageCropperModule,
    ReactiveFormsModule,
    SharedModule,
    ToastrModule.forRoot({
      timeOut: 30000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: false
    }),
    UsersModule,
    MatTabsModule,
    PipesModule,
    CatalogueSearchModule
  ],
  exports: [
    FolderComponent,
    SummaryMetadataPopupComponent,
    ExportModelsComponent,
    HistoryComponent,
    ModelPathComponent,
    ElementSelectorComponent,
    ModelPathComponent,
    NotFoundComponent,
    DataModelDefaultComponent,
    ServerErrorComponent,
    ServerTimeoutComponent,
    NotImplementedComponent,
    NotAuthorizedComponent,
    DataModelComponent,
    McDataSetMetadataComponent,
    TableButtonsComponent,
    AnnotationListComponent,
    ProfilePictureComponent,
    SummaryMetadataTableComponent,
    SummaryMetadataChartComponent,
    ElementOwnedDataTypeListComponent,
    ElementChildDataClassesListComponent,
    McDataSetMetadataComponent,
    ElementStatusComponent,
    ElementClassificationsComponent,
    ElementAliasComponent,
    PropertiesDirective,
    ElementDataTypeComponent,
    MultiplicityComponent,
    ElementLinkListComponent,
    AttachmentListComponent,
    DataClassComponent,
    ShowIfRolesWritableDirective,
    DataModelMainComponent,
    DclWrapperComponent,
    DataModelStep1Component,
    DataModelStep2Component,
    DataClassMainComponent,
    DataClassStep1Component,
    DataClassStep2Component,
    DataTypeMainComponent,
    DataTypeStep1Component,
    DataTypeStep2Component,
    DataClassComponentsListComponent,
    AllLinksInPagedListComponent,
    McPagedListComponent,
    ConfigurationComponent,
    UsersComponent,
    UsersTableComponent,
    GroupsComponent,
    GroupsTableComponent,
    PendingUsersComponent,
    PendingUsersTableComponent,
    SubscribedCatalogueComponent,
    SubscribedCataloguesComponent,
    DashboardComponent,
    ModulesComponent,
    PluginsComponent,
    ActiveSessionsComponent,
    ModelManagementComponent,
    DataElementComponent,
    NewDataTypeInlineComponent,
    DataElementMainComponent,
    DataElementStep1Component,
    DataElementStep2Component,
    HomeComponent,
    ImportModelsComponent,
    TerminologyComponent,
    TermListComponent,
    TermCodeSetListComponent,
    CreateTermDialogComponent,
    CreateTermRelationshipTypeDialogComponent,
    CreateTermRelationshipDialogComponent,
    TwoSidePanelComponent,
    UiViewComponent,
    ModelsComponent,
    FavouritesComponent,
    ShowIfRoleIsWritableDirective,
    McEnumerationListWithCategoryComponent,
    ClassificationComponent,
    ClassifiedElementsListComponent,
    AppContainerComponent,
    NavbarComponent,
    CapitalizePipe,
    FilterPipe,
    ByteArrayToBase64Pipe,
    GroupComponent,
    DataTypeComponent,
    ElementChildDataElementsListComponent,
    SettingsComponent,
    AboutComponent,
    ResetPasswordComponent,
    TermComponent,
    TermRelationshipsComponent,
    ByteArrayToBase64Pipe,
    SettingsComponent,
    LinkSuggestionComponent,
    ModelComparisonComponent,
    CodeSetMainComponent,
    MultipleTermsSelectorComponent,
    CodeSetComponent,
    CodeSetTermsTableComponent,
    BulkEditModalComponent,
    BulkDeleteModalComponent,
    ModelsMergingGraphComponent,
    VersioningGraphModalComponent,
    BulkDeleteModalComponent,
    BaseComponent,
    ReferenceDataComponent,
    EnumerationValuesComponent,
    EnumerationValuesDetailsComponent,
    ConstraintsRulesComponent,
    SubscribedCatalogueMainComponent,
    SubscribedCatalogueDetailComponent,
    ConstraintsRulesComponent,
    LoadingIndicatorComponent,
    ApiPropertyTableComponent,
    SubscribedCatalogueMainComponent,
    SubscribedCatalogueDetailComponent,
    ApiPropertyTableComponent,
    FederatedDataModelMainComponent,
    FederatedDataModelDetailComponent,
    NewFederatedSubscriptionModalComponent,
    ProfileDetailsComponent,
    DefaultProfileComponent,
    OpenIdConnectAuthorizeComponent,
    ProfileDataViewComponent,
    NewerVersionsComponent,
    TerminologyMainComponent,
    SkeletonBadgeComponent,
    MoreDescriptionComponent,
    ReferenceDataModelMainComponent,
    ModelHeaderComponent
  ]
})
export class CatalogueModule {}
