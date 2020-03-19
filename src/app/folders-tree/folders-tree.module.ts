import { NgModule } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FoldersTreeComponent } from './folders-tree.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HighlighterPipe } from '../pipes/highlighter.pipe';
import { StringifyPipe } from '../pipes/stringify.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FolderService } from './folder.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatTreeModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [
    FoldersTreeComponent,
    HighlighterPipe,
    StringifyPipe
  ],
  entryComponents: [
    FoldersTreeComponent
  ],
  exports: [
    FoldersTreeComponent,
    HighlighterPipe,
    StringifyPipe,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    FolderService
  ]
})
export class FoldersTreeModule {
}
