import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FoldersTreeModule } from 'src/app/folders-tree/folders-tree.module';
import { AdminModule } from '../admin/admin.module';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { FolderComponent } from 'src/app/folder/folder.component';
import { FolderDetailComponent } from 'src/app/folder/folder-detail.component';
import { AdvancedSearchBarComponent } from 'src/app/search/advanced-search-bar/advanced-search-bar.component';
import { ShareWithComponent } from 'src/app/access/share-with/share-with.component';
import { DataModelsExportComponent } from 'src/app/data-models-export/data-models-export.component';
import { UserAccessNewComponent } from 'src/app/access/user-access-new.component';
import { GroupAccessNewComponent } from 'src/app/access/group-access-new.component';
import { HistoryComponent } from 'src/app/folder/history.component';
import { MarkdownTextAreaComponent } from 'src/app/utility/markdown-text-area.component';
import { ElementLinkComponent } from 'src/app/utility/element-link/element-link.component';
import { HelpDialogComponent } from 'src/app/search/help-dialog/help-dialog.component';
import { DateFromToComponent } from 'src/app/search/date-from-to/date-from-to.component';
import { MarkdownDirective } from 'src/app/directives/markdown.directive';
import { ModelPathComponent } from 'src/app/utility/model-path/model-path.component';
import { ElementSelectorComponent } from 'src/app/utility/element-selector.component';
import { ModelSelectorTreeComponent } from 'src/app/model-selector-tree/model-selector-tree.component';
import { NotFoundComponent } from 'src/app/errors/not-found/not-found.component';
import { DataModelDefaultComponent } from 'src/app/utility/data-model-default.component';
import { ServerErrorComponent } from 'src/app/errors/server-error/server-error.component';
import { NotImplementedComponent } from 'src/app/errors/not-implemented/not-implemented.component';
import { NotAuthorizedComponent } from 'src/app/errors/not-authorized/not-authorized.component';
import { DataModelComponent } from 'src/app/dataModel/data-model.component';
import { DataModelDetailComponent } from 'src/app/dataModel/data-model-detail.component';
import { McDataSetMetadataComponent } from 'src/app/shared/mc-data-set-metadata/mc-data-set-metadata.component';
import { TableButtonsComponent } from 'src/app/shared/table-buttons/table-buttons.component';
import { AnnotationListComponent } from 'src/app/shared/annotation-list/annotation-list.component';
import { ProfilePictureComponent } from 'src/app/shared/profile-picture/profile-picture.component';
import { SummaryMetadataTableComponent } from 'src/app/shared/summary-metadata-table/summary-metadata-table.component';
import { SummaryMetadataMapComponent } from 'src/app/shared/summary-metadata-map/summary-metadata-map.component';
import { ElementOwnedDataTypeListComponent } from 'src/app/shared/element-owned-data-type-list/element-owned-data-type-list.component';
import { ElementChildDataClassesListComponent } from 'src/app/shared/element-child-data-classes-list/element-child-data-classes-list.component';
import { ElementStatusComponent } from 'src/app/utility/element-status/element-status.component';
import { ElementClassificationsComponent } from 'src/app/utility/element-classifications/element-classifications.component';
import { ElementAliasComponent } from 'src/app/utility/element-alias/element-alias.component';
import { PropertiesDirective } from 'src/app/directives/properties.directive';
import { ElementDataTypeComponent } from 'src/app/shared/element-data-type/element-data-type.component';
import { DataTypeListButtonsComponent } from 'src/app/shared/data-type-list-buttons/data-type-list-buttons.component';
import { MultiplicityComponent } from 'src/app/shared/multiplicity/multiplicity.component';
import { ElementLinkListComponent } from 'src/app/shared/element-link-list/element-link-list.component';
import { AttachmentListComponent } from 'src/app/shared/attachment-list/attachment-list.component';
import { FileSizePipe } from 'src/app/directives/file-size.pipe';

import { NewVersionDataModelComponent } from 'src/app/dataModel/new-version-data-model/new-version-data-model.component';
import { DataClassComponent } from 'src/app/dataClass/data-class/data-class.component';
import { DataClassDetailsComponent } from 'src/app/dataClass/data-class-details/data-class-details.component';
import { ShowIfRolesWritableDirective } from 'src/app/directives/show-if-roles-writable.directive';
import { DataModelMainComponent } from 'src/app/wizards/dataModel/data-model-main/data-model-main.component';
import { DclWrapperComponent } from 'src/app/wizards/dcl-wrapper.component';
import { DataModelStep1Component } from 'src/app/wizards/dataModel/data-model-step1/data-model-step1.component';
import { DataModelStep2Component } from 'src/app/wizards/dataModel/data-model-step2/data-model-step2.component';
import { DataClassMainComponent } from 'src/app/wizards/dataClass/data-class-main/data-class-main.component';
import { DataClassStep1Component } from 'src/app/wizards/dataClass/data-class-step1/data-class-step1.component';
import { DataClassStep2Component } from 'src/app/wizards/dataClass/data-class-step2/data-class-step2.component';
import { DataClassStep3Component } from 'src/app/wizards/dataClass/data-class-step3/data-class-step3.component';
import { DataTypeMainComponent } from 'src/app/wizards/dataType/data-type-main/data-type-main.component';
import { DataTypeStep1Component } from 'src/app/wizards/dataType/data-type-step1/data-type-step1.component';
import { DataTypeStep2Component } from 'src/app/wizards/dataType/data-type-step2/data-type-step2.component';
import { ContentTableComponent } from 'src/app/shared/content-table/content-table.component';
import { AllLinksInPagedListComponent } from 'src/app/utility/all-links-in-paged-list/all-links-in-paged-list.component';
import { McPagedListComponent } from 'src/app/utility/mc-paged-list/mc-paged-list.component';
import { ConfigurationComponent } from 'src/app/admin/configuration/configuration.component';
import { UsersComponent } from 'src/app/admin/users/users.component';
import { UsersTableComponent } from 'src/app/admin/users-table/users-table.component';
import { GroupsComponent } from 'src/app/admin/groups/groups.component';
import { GroupsTableComponent } from 'src/app/admin/groups-table/groups-table.component';
import { PendingUsersComponent } from 'src/app/admin/pending-users/pending-users.component';
import { PendingUsersTableComponent } from 'src/app/admin/pending-users-table/pending-users-table.component';
import { DashboardComponent } from 'src/app/admin/home/home.component';
import { ModulesComponent } from 'src/app/admin/home/modules/modules.component';
import { PluginsComponent } from 'src/app/admin/home/plugins/plugins.component';
import { ActiveSessionsComponent } from 'src/app/admin/home/active-sessions/active-sessions.component';
import { ModelManagementComponent } from 'src/app/admin/model-management/model-management.component';
import { DataElementComponent } from 'src/app/dataElement/data-element/data-element.component';
import { DataElementDetailsComponent } from 'src/app/dataElement/data-element-details/data-element-details.component';
import { NewDataTypeInlineComponent } from 'src/app/utility/new-data-type-inline/new-data-type-inline.component';
import { DataElementMainComponent } from 'src/app/wizards/dataElement/data-element-main/data-element-main.component';
import { DataElementStep1Component } from 'src/app/wizards/dataElement/data-element-step1/data-element-step1.component';
import { DataElementStep2Component } from 'src/app/wizards/dataElement/data-element-step2/data-element-step2.component';
import { DataElementStep3Component } from 'src/app/wizards/dataElement/data-element-step3/data-element-step3.component';
import { HomeComponent } from 'src/app/home/home.component';
import { ImportComponent } from 'src/app/import/import.component';
import { SearchComponent } from 'src/app/search/search.component';
import { TerminologyComponent } from 'src/app/terminology/terminology.component';
import { TerminologyDetailsComponent } from 'src/app/terminology/terminology-details/terminology-details.component';
import { ClassifierMainComponent } from 'src/app/wizards/classifier/classifier-main/classifier-main.component';
import { ClassifierStep1Component } from 'src/app/wizards/classifier/classifier-step1/classifier-step1.component';
import { TwoSidePanelComponent } from 'src/app/two-side-panel/two-side-panel.component';
import { UiViewComponent } from 'src/app/shared/ui-view/ui-view.component';
import { ModelsComponent } from 'src/app/shared/models/models.component';
import { FavouritesComponent } from 'src/app/shared/favourites/favourites.component';
import { ElementIconComponent } from 'src/app/shared/element-icon/element-icon.component';
import { ShowIfRoleIsWritableDirective } from 'src/app/directives/show-if-role-is-writable.directive';
import { McEnumerationListWithCategoryComponent } from 'src/app/utility/mc-enumeration-list-with-category/mc-enumeration-list-with-category.component';
import { ClassificationComponent } from 'src/app/classification/classification.component';
import { ClassificationDetailsComponent } from 'src/app/classification/classification-details/classification-details.component';
import { ClassifiedElementsListComponent } from 'src/app/shared/classified-elements-list/classified-elements-list.component';
import { AppContainerComponent } from 'src/app/app-container/app-container.component';
import { NavbarComponent } from 'src/app/navbar/navbar.component';
import { CapitalizePipe } from 'src/app/pipes/capitalize.pipe';
import { FilterPipe } from 'src/app/directives/filter-pipe.directive';
import { ByteArrayToBase64Pipe } from 'src/app/pipes/byte-array-to-base64.pipe';
import { GroupComponent } from 'src/app/admin/group/group.component';
import { DataTypeComponent } from 'src/app/data-type/data-type.component';
import { DataTypeDetailComponent } from 'src/app/data-type/data-type-detail/data-type-detail.component';
import { ElementChildDataElementsListComponent } from 'src/app/shared/element-child-data-elements-list/element-child-data-elements-list.component';
import { SettingsComponent } from 'src/app/userArea/settings/settings.component';
import { AboutComponent } from 'src/app/about/about.component';
import { ResetPasswordComponent } from 'src/app/reset-password/reset-password.component';
import { TermComponent } from 'src/app/term/term/term.component';
import { TermDetailsComponent } from 'src/app/term/term-details/term-details.component';
import { TermRelationshipsComponent } from 'src/app/utility/term-relationships/term-relationships.component';
import { LinkSuggestionComponent } from 'src/app/link-suggestion/link-suggestion.component';
import { ModelComparisonComponent } from 'src/app/model-comparison/model-comparison.component';
import { CodeSetMainComponent } from 'src/app/wizards/codeSet/code-set-main/code-set-main.component';
import { CodeSetStep1Component } from 'src/app/wizards/codeSet/code-set-step1/code-set-step1.component';
import { MultipleTermsSelectorComponent } from 'src/app/utility/multiple-terms-selector/multiple-terms-selector.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ToastrModule } from 'ngx-toastr';
import { ImageCropperModule } from 'ngx-image-cropper';
import { UIRouterModule } from '@uirouter/angular';
import { AngularSplitModule } from 'angular-split';
import { UserIdleModule } from 'angular-user-idle';
import {CodeSetComponent} from '../../code-set/code-set/code-set.component';
import {CodeSetDetailsComponent} from '../../code-set/code-set-details/code-set-details.component';
import {CodeSetTermsTableComponent} from '../../shared/code-set-terms-table/code-set-terms-table.component';
import { DiagramTabComponent } from '../../diagram/diagram-tab/diagram-tab.component';
import { DiagramPopupComponent } from '../../diagram/diagram-popup/diagram-popup.component';
import { DiagramComponent } from '../../diagram/diagram/diagram.component';
import { DiagramToolbarComponent } from '../../diagram/diagram-toolbar/diagram-toolbar.component';



@NgModule({
  declarations: [
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
    SummaryMetadataMapComponent,
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
    CodeSetTermsTableComponent],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NoopAnimationsModule,
    DragDropModule,
    CommonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AngularSplitModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 30000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: false
    }),
    ImageCropperModule,
    FoldersTreeModule,
    AdminModule,
    SharedModule,
    UsersModule,
    UserIdleModule.forRoot({idle: 600, timeout: 300})
  ],
  exports: [FolderComponent,
    FolderDetailComponent,
    AdvancedSearchBarComponent,
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
    SummaryMetadataMapComponent,
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
    CodeSetTermsTableComponent]
})
export class CatalogueModule { }
