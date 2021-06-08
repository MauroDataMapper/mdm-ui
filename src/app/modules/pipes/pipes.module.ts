import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlighterPipe } from '@mdm/pipes/highlighter.pipe';



@NgModule({
  declarations: [  HighlighterPipe],
  imports: [
    CommonModule
  ],
  exports: [
    HighlighterPipe
  ]
})
export class PipesModule { }
