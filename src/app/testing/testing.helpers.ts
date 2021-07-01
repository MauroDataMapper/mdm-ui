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
import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { TestingModule } from './testing.module';

/**
 * Represents additional configuration to use when setting up the test module.
 */
export interface TestModuleConfiguration {
  /**
   * Provide an optional list of additional component declarations.
   */
  declarations?: any[];

  /**
   * Provide an optional list of additional component/module imports.
   */
  imports?: any[];

  /**
   * Provide an optional list of additional providers to use for dependency injection.
   */
  providers?: any[];
}

export interface TestComponentConfiguration {
  detectChangesOnCreation?: boolean;
}

/**
 * Represents a created component for testing plus a fixture.
 *
 * @typedef T The type of component under test.
 */
export class ComponentHarness<T> {
  constructor(public component: T, public fixture: ComponentFixture<T>) { }

  get isComponentCreated() {
    return !!this.component;
  }

  detectChanges(setter?: (component: T) => void) {
    if (setter) {
      setter(this.component);
    }
    this.fixture.detectChanges();
  }
}

/**
 * Setup the test module for working with a service.
 *
 * @typedef T The type of the service under test.
 * @param service The type of service under test.
 * @param configuration Optionally provide additional configuration for the test module.
 * @returns A new instance of the service under test.
 */
export const setupTestModuleForService = <T>(service: Type<T>, configuration?: TestModuleConfiguration): T => {
  TestBed.configureTestingModule({
    imports: [TestingModule, ...configuration?.imports ?? []],
    providers: configuration?.providers ?? []
  });
  return TestBed.inject(service);
};

/**
 * Setup the test module for working with a component.
 *
 * @typedef T The type of the component under test.
 * @param componentType The type of the component under test.
 * @param moduleConfig Optionally provide additional configuration for the test module.
 * @param componentConfig Optionally provide additional configuration for the component under test.
 * @returns A new `ComponentHarness<T>` containing an instance of the component under test with a fixture.
 */
export const setupTestModuleForComponent = async <T>(
  componentType: Type<T>,
  moduleConfig?: TestModuleConfiguration,
  componentConfig?: TestComponentConfiguration) => {
  await TestBed
    .configureTestingModule({
      imports: [TestingModule, ...moduleConfig?.imports ?? []],
      declarations: [
        componentType,
        MockComponent(NgxSkeletonLoaderComponent),
        ...moduleConfig?.declarations ?? []],
      providers: moduleConfig?.providers ?? []
    })
    .compileComponents();

  const fixture = TestBed.createComponent(componentType);
  const component = fixture.componentInstance;

  if (componentConfig?.detectChangesOnCreation) {
    fixture.detectChanges();
  }

  return new ComponentHarness(component, fixture);
};