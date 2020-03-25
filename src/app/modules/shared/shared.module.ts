import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableFormButtonsComponent } from '../../utility/editable-form-buttons/editable-form-buttons.component';
import { FormsModule } from '@angular/forms';
import { MoreDescriptionComponent } from '../../shared/more-description/more-description.component';
import { UIRouterModule } from '@uirouter/angular';
import { McSelectComponent } from '../../utility/mc-select/mc-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { InlineTextEditComponent } from '../../shared/inline-text-edit/inline-text-edit.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ComparisonTreeComponent } from '../../shared/comparison-tree/comparison-tree.component';
import { MetadataCompareComponent } from '../../shared/metadata-compare/metadata-compare.component';
import { EnumerationCompareComponent } from '../../shared/enumeration-compare/enumeration-compare.component';
import { MaterialModule } from '../material/material.module';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ErrorComponent } from 'src/app/errors/error.component';
import { FlexLayoutModule } from '@angular/flex-layout';

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
    ErrorComponent
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
    ReactiveFormsModule
  ]
})
export class SharedModule {}
