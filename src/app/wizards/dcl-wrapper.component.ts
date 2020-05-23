/*
Copyright 2020 University of Oxford

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
import {
  NgModule,
  Output,
  Component,
  Compiler,
  ViewContainerRef,
  ViewChild,
  Input,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  ChangeDetectorRef,
  EventEmitter, OnChanges, AfterViewInit
} from '@angular/core';

// Helper component to add dynamic components
@Component({
  selector: 'mdm-dcl-wrapper',
  template: `
    <div #target></div>`
})
export class DclWrapperComponent implements OnChanges, AfterViewInit {
  @ViewChild('target', {read: ViewContainerRef, static: false}) target;
  @Input() type;

  stepVal: any;

  @Output() stepChanged = new EventEmitter<any>();

  @Input()
  get step() {
    return this.stepVal;
  }

  set step(val) {
    this.stepVal = val;
    this.stepChanged.emit();
  }

  private isViewInitialized = false;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private cdRef: ChangeDetectorRef) {

  }

  updateComponent() {
    if (!this.isViewInitialized) {
      return;
    }

    if (this.step.compRef) {
      this.step.compRef.destroy();
    }

    const factory = this.componentFactoryResolver.resolveComponentFactory(this.type);
    this.step.compRef = this.target.createComponent(factory);
    this.step.compRef.instance.step = this.step;
    // to access the created instance use
    // this.compRef.instance.someProperty = 'someValue';
    // this.compRef.instance.someOutput.subscribe(val => doSomething());

    this.cdRef.detectChanges();

  }

  ngOnChanges() {
    this.updateComponent();
  }

  ngAfterViewInit() {

    this.isViewInitialized = true;
    this.updateComponent();
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() {
    if (this.step.compRef) {
      this.step.compRef.destroy();
    }
  }
}
