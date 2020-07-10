import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Plugin1Component } from './plugin1.component';
import { MdmResourcesModule } from 'mdm-resources';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  declarations: [Plugin1Component],
  imports: [
    CommonModule,
    BrowserModule,
    MdmResourcesModule,
    HttpClientModule
  ]
})
export class Plugin1Module {
  static entry = Plugin1Component;
 }
