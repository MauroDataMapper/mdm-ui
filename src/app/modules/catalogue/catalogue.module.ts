import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FoldersTreeModule } from '@mdm/folders-tree/folders-tree.module';
import { AdminModule } from '../admin/admin.module';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { FolderComponent } from '@mdm/folder/folder.component';
import { FolderDetailComponent } from '@mdm/folder/folder-detail.component';
import { AdvancedSearchBarComponent } from '@mdm/search/advanced-search-bar/advanced-search-bar.component';
import { ShareWithComponent } from '@mdm/access/share-with/share-with.component';
import { DataModelsExportComponent } from '@mdm/data-models-export/data-models-export.component';
import { UserAccessNewComponent } from '@mdm/access/user-access-new.component';
import { GroupAccessNewComponent } from '@mdm/access/group-access-new.component';
import { HistoryComponent } from '@mdm/folder/history.component';
import { MarkdownTextAreaComponent } from '@mdm/utility/markdown/markdown-text-area/markdown-text-area.component';
import { ElementLinkComponent } from '@mdm/utility/element-link/element-link.component';
import { HelpDialogComponent } from '@mdm/search/help-dialog/help-dialog.component';
import { DateFromToComponent } from '@mdm/search/date-from-to/date-from-to.component';
import { MarkdownDirective } from '@mdm/directives/markdown.directive';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';
import { ElementSelectorComponent } from '@mdm/utility/element-selector.component';
import { ModelSelectorTreeComponent } from '@mdm/model-selector-tree/model-selector-tree.component';
import { NotFoundComponent } from '@mdm/errors/not-found/not-found.component';
import { DataModelDefaultComponent } from '@mdm/utility/data-model-default.component';
import { ServerErrorComponent } from '@mdm/errors/server-error/server-error.component';
import { NotImplementedComponent } from '@mdm/errors/not-implemented/not-implemented.component';
import { NotAuthorizedComponent } from '@mdm/errors/not-authorized/not-authorized.component';
import { DataModelComponent } from '@mdm/dataModel/data-model.component';
import { DataModelDetailComponent } from '@mdm/dataModel/data-model-detail.component';
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
import { DataTypeListButtonsComponent } from '@mdm/shared/data-type-list-buttons/data-type-list-buttons.component';
import { MultiplicityComponent } from '@mdm/shared/multiplicity/multiplicity.component';
import { ElementLinkListComponent } from '@mdm/shared/element-link-list/element-link-list.component';
import { AttachmentListComponent } from '@mdm/shared/attachment-list/attachment-list.component';
import { FileSizePipe } from '@mdm/directives/file-size.pipe';
import { SummaryMetadataTableComponent } from '@mdm/shared/summary-metadata/summary-metadata-table/summary-metadata-table.component';
import { SummaryMetadataChartComponent } from '@mdm/shared/summary-metadata/summary-metadata-chart/summary-metadata-chart.component';

import { NewVersionDataModelComponent } from '@mdm/dataModel/new-version-data-model/new-version-data-model.component';
import { DataClassComponent } from '@mdm/dataClass/data-class/data-class.component';
import { DataClassDetailsComponent } from '@mdm/dataClass/data-class-details/data-class-details.component';
import { ShowIfRolesWritableDirective } from '@mdm/directives/show-if-roles-writable.directive';
import { DataModelMainComponent } from '@mdm/wizards/dataModel/data-model-main/data-model-main.component';
import { DclWrapperComponent } from '@mdm/wizards/dcl-wrapper.component';
import { DataModelStep1Component } from '@mdm/wizards/dataModel/data-model-step1/data-model-step1.component';
import { DataModelStep2Component } from '@mdm/wizards/dataModel/data-model-step2/data-model-step2.component';
import { DataClassMainComponent } from '@mdm/wizards/dataClass/data-class-main/data-class-main.component';
import { DataClassStep1Component } from '@mdm/wizards/dataClass/data-class-step1/data-class-step1.component';
import { DataClassStep2Component } from '@mdm/wizards/dataClass/data-class-step2/data-class-step2.component';
import { DataClassStep3Component } from '@mdm/wizards/dataClass/data-class-step3/data-class-step3.component';
import { DataTypeMainComponent } from '@mdm/wizards/dataType/data-type-main/data-type-main.component';
import { DataTypeStep1Component } from '@mdm/wizards/dataType/data-type-step1/data-type-step1.component';
import { DataTypeStep2Component } from '@mdm/wizards/dataType/data-type-step2/data-type-step2.component';
import { ContentTableComponent } from '@mdm/shared/content-table/content-table.component';
import { AllLinksInPagedListComponent } from '@mdm/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { McPagedListComponent } from '@mdm/utility/mc-paged-list/mc-paged-list.component';
import { ConfigurationComponent } from '@mdm/admin/configuration/configuration.component';
import { UsersComponent } from '@mdm/admin/users/users.component';
import { UsersTableComponent } from '@mdm/admin/users-table/users-table.component';
import { GroupsComponent } from '@mdm/admin/groups/groups.component';
import { GroupsTableComponent } from '@mdm/admin/groups-table/groups-table.component';
import { PendingUsersComponent } from '@mdm/admin/pending-users/pending-users.component';
import { PendingUsersTableComponent } from '@mdm/admin/pending-users-table/pending-users-table.component';
import { DashboardComponent } from '@mdm/admin/home/home.component';
import { ModulesComponent } from '@mdm/admin/home/modules/modules.component';
import { PluginsComponent } from '@mdm/admin/home/plugins/plugins.component';
import { ActiveSessionsComponent } from '@mdm/admin/home/active-sessions/active-sessions.component';
import { ModelManagementComponent } from '@mdm/admin/model-management/model-management.component';
import { DataElementComponent } from '@mdm/dataElement/data-element/data-element.component';
import { DataElementDetailsComponent } from '@mdm/dataElement/data-element-details/data-element-details.component';
import { NewDataTypeInlineComponent } from '@mdm/utility/new-data-type-inline/new-data-type-inline.component';
import { DataElementMainComponent } from '@mdm/wizards/dataElement/data-element-main/data-element-main.component';
import { DataElementStep1Component } from '@mdm/wizards/dataElement/data-element-step1/data-element-step1.component';
import { DataElementStep2Component } from '@mdm/wizards/dataElement/data-element-step2/data-element-step2.component';
import { DataElementStep3Component } from '@mdm/wizards/dataElement/data-element-step3/data-element-step3.component';
import { HomeComponent } from '@mdm/home/home.component';
import { ImportComponent } from '@mdm/import/import.component';
import { SearchComponent } from '@mdm/search/search.component';
import { TerminologyComponent } from '@mdm/terminology/terminology.component';
import { TerminologyDetailsComponent } from '@mdm/terminology/terminology-details/terminology-details.component';
import { ClassifierMainComponent } from '@mdm/wizards/classifier/classifier-main/classifier-main.component';
import { ClassifierStep1Component } from '@mdm/wizards/classifier/classifier-step1/classifier-step1.component';
import { TwoSidePanelComponent } from '@mdm/two-side-panel/two-side-panel.component';
import { UiViewComponent } from '@mdm/shared/ui-view/ui-view.component';
import { ModelsComponent } from '@mdm/shared/models/models.component';
import { FavouritesComponent } from '@mdm/shared/favourites/favourites.component';
import { ElementIconComponent } from '@mdm/shared/element-icon/element-icon.component';
import { ShowIfRoleIsWritableDirective } from '@mdm/directives/show-if-role-is-writable.directive';
import { McEnumerationListWithCategoryComponent } from '@mdm/utility/mc-enumeration-list-with-category/mc-enumeration-list-with-category.component';
import { ClassificationComponent } from '@mdm/classification/classification.component';
import { ClassificationDetailsComponent } from '@mdm/classification/classification-details/classification-details.component';
import { ClassifiedElementsListComponent } from '@mdm/shared/classified-elements-list/classified-elements-list.component';
import { AppContainerComponent } from '@mdm/app-container/app-container.component';
import { NavbarComponent } from '@mdm/navbar/navbar.component';
import { CapitalizePipe } from '@mdm/pipes/capitalize.pipe';
import { FilterPipe } from '@mdm/directives/filter-pipe.directive';
import { ByteArrayToBase64Pipe } from '@mdm/pipes/byte-array-to-base64.pipe';
import { GroupComponent } from '@mdm/admin/group/group.component';
import { DataTypeComponent } from '@mdm/data-type/data-type.component';
import { DataTypeDetailComponent } from '@mdm/data-type/data-type-detail/data-type-detail.component';
import { ElementChildDataElementsListComponent } from '@mdm/shared/element-child-data-elements-list/element-child-data-elements-list.component';
import { SettingsComponent } from '@mdm/userArea/settings/settings.component';
import { AboutComponent } from '@mdm/about/about.component';
import { ResetPasswordComponent } from '@mdm/reset-password/reset-password.component';
import { TermComponent } from '@mdm/term/term/term.component';
import { TermDetailsComponent } from '@mdm/term/term-details/term-details.component';
import { TermRelationshipsComponent } from '@mdm/utility/term-relationships/term-relationships.component';
import { LinkSuggestionComponent } from '@mdm/link-suggestion/link-suggestion.component';
import { ModelComparisonComponent } from '@mdm/model-comparison/model-comparison.component';
import { CodeSetMainComponent } from '@mdm/wizards/codeSet/code-set-main/code-set-main.component';
import { CodeSetStep1Component } from '@mdm/wizards/codeSet/code-set-step1/code-set-step1.component';
import { MultipleTermsSelectorComponent } from '@mdm/utility/multiple-terms-selector/multiple-terms-selector.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrModule } from 'ngx-toastr';
import { ChartsModule } from 'ng2-charts';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AngularSplitModule } from 'angular-split';
import { UserIdleModule } from 'angular-user-idle';
import { CodeSetComponent } from '@mdm/code-set/code-set/code-set.component';
import { CodeSetDetailsComponent } from '@mdm/code-set/code-set-details/code-set-details.component';
import { CodeSetTermsTableComponent } from '@mdm/shared/code-set-terms-table/code-set-terms-table.component';
import { DiagramTabComponent } from '@mdm/diagram/diagram-tab/diagram-tab.component';
import { DiagramPopupComponent } from '@mdm/diagram/diagram-popup/diagram-popup.component';
import { DiagramComponent } from '@mdm/diagram/diagram/diagram.component';
import { DiagramToolbarComponent } from '@mdm/diagram/diagram-toolbar/diagram-toolbar.component';
import {SummaryMetadataPopupComponent} from '@mdm/shared/summary-metadata/summary-metadata-popup/summary-metadata-popup.component';
import {NewVersionCodeSetComponent} from '@mdm/code-set/new-version-code-set/new-version-code-set.component';
import { MarkedPipe } from '@mdm/pipes/marked.pipe';



@NgModule({
  declarations: [
    MarkedPipe,
    FolderComponent,
    FolderDetailComponent,
    AdvancedSearchBarComponent,
    ShareWithComponent,
    DataModelsExportComponent ,
    UserAccessNewComponent,
    DiagramComponent,
    DiagramTabComponent,
    DiagramPopupComponent,
    DiagramToolbarComponent,
    GroupAccessNewComponent,
    HistoryComponent,
    MarkdownTextAreaComponent,
    ElementLinkComponent,
    HelpDialogComponent,
    DateFromToComponent,
    MarkdownDirective,
    ModelPathComponent,
    ElementSelectorComponent,
    ModelPathComponent,
    ModelSelectorTreeComponent,
    NotFoundComponent,
    DataModelDefaultComponent,
    ServerErrorComponent,
    NotImplementedComponent,
    NotAuthorizedComponent,
    DataModelComponent,
    DataModelDetailComponent,
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
    DataTypeListButtonsComponent,
    MultiplicityComponent,
    ElementLinkListComponent,
    AttachmentListComponent,
    FileSizePipe,
    NewVersionDataModelComponent,
    DataClassComponent,
    DataClassDetailsComponent,
    ShowIfRolesWritableDirective,
    DataModelMainComponent,
    DclWrapperComponent,
    DataModelStep1Component,
    DataModelStep2Component,
    DataClassMainComponent,
    DataClassStep1Component,
    DataClassStep2Component,
    DataClassStep3Component,
    DataTypeMainComponent,
    DataTypeStep1Component,
    DataTypeStep2Component,
    ContentTableComponent,
    ContentTableComponent,
    AllLinksInPagedListComponent,
    McPagedListComponent,
    ConfigurationComponent,
    UsersComponent,
    UsersTableComponent,
    GroupsComponent,
    GroupsTableComponent,
    PendingUsersComponent,
    PendingUsersTableComponent,
    DashboardComponent,
    ModulesComponent,
    PluginsComponent,
    ActiveSessionsComponent,
    ModelManagementComponent,
    DataElementComponent,
    DataElementDetailsComponent,
    NewDataTypeInlineComponent,
    DataElementMainComponent,
    DataElementStep1Component,
    DataElementStep2Component,
    DataElementStep3Component,
    HomeComponent,
    ImportComponent,
    SearchComponent,
    TerminologyComponent,
    TerminologyDetailsComponent,
    ClassifierMainComponent,
    ClassifierStep1Component,
    TwoSidePanelComponent,
    UiViewComponent,
    ModelsComponent,
    FavouritesComponent,
    ElementIconComponent,
    ShowIfRoleIsWritableDirective,
    McEnumerationListWithCategoryComponent,
    ClassificationComponent,
    ClassificationDetailsComponent,
    ClassifiedElementsListComponent,
    AppContainerComponent,
    NavbarComponent,
    CapitalizePipe,
    FilterPipe,
    ByteArrayToBase64Pipe,
    GroupComponent,
    DataTypeComponent,
    DataTypeDetailComponent,
    ElementChildDataElementsListComponent,
    SettingsComponent,
    AboutComponent,
    ResetPasswordComponent,
    TermComponent,
    TermDetailsComponent,
    TermRelationshipsComponent,
    ByteArrayToBase64Pipe,
    SettingsComponent,
    LinkSuggestionComponent,
    ModelComparisonComponent,
    CodeSetMainComponent,
    CodeSetStep1Component,
    MultipleTermsSelectorComponent,
    CodeSetComponent,
    CodeSetDetailsComponent,
    CodeSetTermsTableComponent,
    NewVersionCodeSetComponent],
  imports: [
    AdminModule,
    AngularSplitModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    ChartsModule,
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
    UserIdleModule.forRoot({idle: 600, timeout: 300}),
    UsersModule
  ],
  exports: [
    MarkedPipe,
    FolderComponent,
    FolderDetailComponent,
    AdvancedSearchBarComponent,
    SummaryMetadataPopupComponent,
    ShareWithComponent,
    DataModelsExportComponent ,
    UserAccessNewComponent,
    GroupAccessNewComponent,
    HistoryComponent,
    MarkdownTextAreaComponent,
    ElementLinkComponent,
    HelpDialogComponent,
    DateFromToComponent,
    MarkdownDirective,
    ModelPathComponent,
    ElementSelectorComponent,
    ModelPathComponent,
    ModelSelectorTreeComponent,
    NotFoundComponent,
    DataModelDefaultComponent,
    ServerErrorComponent,
    NotImplementedComponent,
    NotAuthorizedComponent,
    DataModelComponent,
    DataModelDetailComponent,
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
    DataTypeListButtonsComponent,
    MultiplicityComponent,
    ElementLinkListComponent,
    AttachmentListComponent,
    FileSizePipe,
    NewVersionDataModelComponent,
    DataClassComponent,
    DataClassDetailsComponent,
    ShowIfRolesWritableDirective,
    DataModelMainComponent,
    DclWrapperComponent,
    DataModelStep1Component,
    DataModelStep2Component,
    DataClassMainComponent,
    DataClassStep1Component,
    DataClassStep2Component,
    DataClassStep3Component,
    DataTypeMainComponent,
    DataTypeStep1Component,
    DataTypeStep2Component,
    ContentTableComponent,
    ContentTableComponent,
    AllLinksInPagedListComponent,
    McPagedListComponent,
    ConfigurationComponent,
    UsersComponent,
    UsersTableComponent,
    GroupsComponent,
    GroupsTableComponent,
    PendingUsersComponent,
    PendingUsersTableComponent,
    DashboardComponent,
    ModulesComponent,
    PluginsComponent,
    ActiveSessionsComponent,
    ModelManagementComponent,
    DataElementComponent,
    DataElementDetailsComponent,
    NewDataTypeInlineComponent,
    DataElementMainComponent,
    DataElementStep1Component,
    DataElementStep2Component,
    DataElementStep3Component,
    HomeComponent,
    ImportComponent,
    SearchComponent,
    TerminologyComponent,
    TerminologyDetailsComponent,
    ClassifierMainComponent,
    ClassifierStep1Component,
    TwoSidePanelComponent,
    UiViewComponent,
    ModelsComponent,
    FavouritesComponent,
    ElementIconComponent,
    ShowIfRoleIsWritableDirective,
    McEnumerationListWithCategoryComponent,
    ClassificationComponent,
    ClassificationDetailsComponent,
    ClassifiedElementsListComponent,
    AppContainerComponent,
    NavbarComponent,
    CapitalizePipe,
    FilterPipe,
    ByteArrayToBase64Pipe,
    GroupComponent,
    DataTypeComponent,
    DataTypeDetailComponent,
    ElementChildDataElementsListComponent,
    SettingsComponent,
    AboutComponent,
    ResetPasswordComponent,
    TermComponent,
    TermDetailsComponent,
    TermRelationshipsComponent,
    ByteArrayToBase64Pipe,
    SettingsComponent,
    LinkSuggestionComponent,
    ModelComparisonComponent,
    CodeSetMainComponent,
    CodeSetStep1Component,
    MultipleTermsSelectorComponent,
    CodeSetComponent,
    CodeSetDetailsComponent,
    CodeSetTermsTableComponent,
    NewVersionCodeSetComponent]
})
export class CatalogueModule { }
