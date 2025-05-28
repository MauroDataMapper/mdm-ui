/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { UIRouterModule } from '@uirouter/angular';
import { pageRoutes, routerConfigFn } from '@mdm/app-routing.module';
import { userPageRoutes } from '@mdm/modules/users-routes/users-routes.module';
import { adminPageRoutes } from '@mdm/modules/admin-routes/admin-routes.module';
import { BaseChartDirective } from 'ng2-charts';
import { MdmResourcesModule, MdmResourcesService } from '@mdm/modules/resources';
import { environment } from '@env/environment';
import { of } from 'rxjs';
import { SecurityHandlerService } from '@mdm/services';
import { FavouriteHandlerService } from '@mdm/services';
import { PathNameService } from '@mdm/shared/path-name/path-name.service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IPasswordStrengthMeterService } from 'angular-password-strength-meter';

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

interface MdmApiPropertiesStub {
  listPublic: jest.Mock;
}

interface MdmResourcesServiceStub {
  apiProperties: MdmApiPropertiesStub;
}

const resourcesStub: MdmResourcesServiceStub = {
  apiProperties: {
    listPublic: jest.fn()
  }
};

resourcesStub.apiProperties.listPublic.mockImplementationOnce(() => of([]));


/**
 * Setup the test module for working with a service.
 *
 * @typedef T The type of the service under test.
 * @param service The type of service under test.
 * @param configuration Optionally provide additional configuration for the test module.
 * @returns A new instance of the service under test.
 */
export const setupTestModuleForService = <T>(service: Type<T>, configuration?: TestModuleConfiguration): T => {

  const hasCustomResourcesProvider = configuration?.providers?.some(
    p => (p as any)?.provide === MdmResourcesService
  )|| service === MdmResourcesService;

  const hasCustomSecurityHandlerService = configuration?.providers?.some(
    p => (p as any)?.provide === SecurityHandlerService
  ) || service === SecurityHandlerService;


  TestBed.configureTestingModule({
    imports: [
      TestingModule,
      ...configuration?.imports ?? [],
      UIRouterModule.forRoot({
        useHash: true,
        states: [
          ... pageRoutes.states,
          ... userPageRoutes.states,
          ... adminPageRoutes.states
        ],
        config: routerConfigFn
      }),

    ],
    providers: [
    ... configuration?.providers ?? [],
    ...(!hasCustomResourcesProvider
      ? [{
        provide: MdmResourcesService,
        useValue: resourcesStub
      }]
      : []),
      ...(!hasCustomSecurityHandlerService
        ? [{
          provide: SecurityHandlerService,
          useValue: { }
        }]
        : [])
    ],

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

  const isStandalone = (componentType as any).ɵcmp?.standalone === true;

  if (!(componentType as any).ɵcmp) {
    throw new Error('setupTestModuleForComponent was passed a non-component');
  }

  const hasCustomResourcesProvider = moduleConfig?.providers?.some(
    p => (p as any)?.provide === MdmResourcesService
  );

  await TestBed
    .configureTestingModule({
      imports: [
        MdmResourcesModule.forRoot({
          defaultHttpRequestOptions: {withCredentials: true},
          apiEndpoint: environment.apiEndpoint
        }),
        UIRouterModule.forRoot({
          useHash: true,
          states: [
            ... pageRoutes.states,
            ... userPageRoutes.states,
            ... adminPageRoutes.states
          ],
          config: routerConfigFn
        }),
        TestingModule,
        BaseChartDirective,
        ...moduleConfig?.imports ?? [],
        ...(isStandalone ? [componentType] : []),
        MatDialogModule
      ],
      providers: [
        ... moduleConfig?.providers ?? [],
        ...(!hasCustomResourcesProvider
          ? [{
            provide: MdmResourcesService,
            useValue: resourcesStub
          }]
          : []),
        {
          provide: SecurityHandlerService, useValue: {}
        },
        {
          provide: MatDialogRef, useValue: {}
        },
        IPasswordStrengthMeterService

      ],
      declarations: [
        MockComponent(NgxSkeletonLoaderComponent),
        ...(isStandalone ? [] : [componentType]),
        ...moduleConfig?.declarations ?? []
      ]

    })
    .compileComponents();

  const fixture = TestBed.createComponent(componentType);
  const component = fixture.componentInstance;

  if (componentConfig?.detectChangesOnCreation) {
    fixture.detectChanges();
  }

  return new ComponentHarness(component, fixture);
};
