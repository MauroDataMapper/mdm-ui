import { NgModule } from '@angular/core';
import { FoldersTreeComponent } from './folders-tree.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HighlighterPipe } from '../pipes/highlighter.pipe';
import { StringifyPipe } from '../pipes/stringify.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FolderService } from './folder.service';
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatDividerModule} from '@angular/material/divider';

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
        BrowserAnimationsModule
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
        StringifyPipe
    ],
    providers: [
        FolderService
    ]
})
export class FoldersTreeModule {
}