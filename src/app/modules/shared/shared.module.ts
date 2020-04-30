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
import { ComparisonTreeComponent } from '@mdm/shared/comparison-tree/comparison-tree.component';
import { MetadataCompareComponent } from '@mdm/shared/metadata-compare/metadata-compare.component';
import { EnumerationCompareComponent } from '@mdm/shared/enumeration-compare/enumeration-compare.component';
import { MaterialModule } from '../material/material.module';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ErrorComponent } from '@mdm/errors/error.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';

@NgModule({
  declarations: [
    EditableFormButtonsComponent,
    MoreDescriptionComponent,
    McSelectComponent,
    InlineTextEditComponent,
    FooterComponent,
    ComparisonTreeComponent,
    MetadataCompareComponent,
    EnumerationCompareComponent,
    ErrorComponent,
    MdmPaginatorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    MatPasswordStrengthModule,
    NgxJsonViewerModule,
    FlexLayoutModule,
    ReactiveFormsModule
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
    ComparisonTreeComponent,
    MetadataCompareComponent,
    EnumerationCompareComponent,
    NgxJsonViewerModule,
    ErrorComponent,
    FlexLayoutModule,
    MdmPaginatorComponent
  ]
})
export class SharedModule {}
