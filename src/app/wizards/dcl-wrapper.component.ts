/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
  Output,
  Component,
  ViewContainerRef,
  ViewChild,
  Input,
  ComponentFactoryResolver,
  ChangeDetectorRef,
  EventEmitter, OnChanges, AfterViewInit, OnDestroy, Type
} from '@angular/core';

// Helper component to add dynamic components
@Component({
  selector: 'mdm-dcl-wrapper',
  template: '<div #target></div>'
})
export class DclWrapperComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Output() stepChanged = new EventEmitter<any>();
  @ViewChild('target', { read: ViewContainerRef, static: false }) target;
  @Input() type : Type<unknown>;
  stepVal: any;

  private isViewInitialized = false;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private cdRef: ChangeDetectorRef) { }

  @Input()
  get step(): any {
    return this.stepVal;
  }
  set step(val) {
    this.stepVal = val;
    this.stepChanged.emit();
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
    this.cdRef.detectChanges();
  }

  ngOnChanges() {
    this.updateComponent();
  }

  ngAfterViewInit() {

    this.isViewInitialized = true;
    this.updateComponent();
  }

  ngOnDestroy() {
    if (this.step.compRef) {
      this.step.compRef.destroy();
    }
  }
}
