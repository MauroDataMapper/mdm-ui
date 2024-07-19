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
import { Injector, NgModule } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { FolderComponent } from './folder/folder.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { DataModelDefaultComponent } from './utility/data-model-default.component';
import { NotImplementedComponent } from './errors/not-implemented/not-implemented.component';
import { NotAuthorizedComponent } from './errors/not-authorized/not-authorized.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { DataModelMainComponent } from './wizards/dataModel/data-model-main/data-model-main.component';
import { DataClassMainComponent } from './wizards/dataClass/data-class-main/data-class-main.component';
import { DataTypeMainComponent } from './wizards/dataType/data-type-main/data-type-main.component';
import { HomeComponent } from './home/home.component';
import { ImportModelsComponent } from './import-models/import-models.component';
import { TerminologyComponent } from './terminology/terminology.component';
import { TwoSidePanelComponent } from './two-side-panel/two-side-panel.component';
import { Ng2StateDeclaration, UIRouterModule } from '@uirouter/angular';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { UiViewComponent } from './shared/ui-view/ui-view.component';
import { ModelsComponent } from './shared/models/models.component';
import { DataModelComponent } from './dataModel/data-model.component';
import { ReferenceDataComponent } from './referenceData/reference-data.component';
import { DataClassComponent } from './dataClass/data-class/data-class.component';
import { DataElementComponent } from './dataElement/data-element/data-element.component';
import { ClassificationComponent } from './classification/classification.component';
import { AppContainerComponent } from './app-container/app-container.component';
import { AppComponent } from './app.component';
import { ExportModelsComponent } from './export-models/export-models.component';
import { DataElementMainComponent } from './wizards/dataElement/data-element-main/data-element-main.component';
import { DataTypeComponent } from './data-type/data-type.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TermComponent } from './term/term/term.component';
import { LinkSuggestionComponent } from './link-suggestion/link-suggestion.component';
import { ModelComparisonComponent } from './model-comparison/model-comparison.component';
import { CodeSetMainComponent } from './wizards/codeSet/code-set-main/code-set-main.component';
import { CodeSetComponent } from './code-set/code-set/code-set.component';
import { ModelsMergingGraphComponent } from './models-merging-graph/models-merging-graph.component';
import { EnumerationValuesComponent } from '@mdm/enumerationValues/enumeration-values/enumeration-values.component';
import {
  HookResult,
  StateObject,
  Transition,
  TransitionService,
  UIRouter
} from '@uirouter/core';
import { EditingService } from '@mdm/services/editing.service';
import { SubscribedCatalogueMainComponent } from './subscribed-catalogues/subscribed-catalogue-main/subscribed-catalogue-main.component';
import { FederatedDataModelMainComponent } from './subscribed-catalogues/federated-data-model-main/federated-data-model-main.component';
import { ServerTimeoutComponent } from './errors/server-timeout/server-timeout.component';
import { NewVersionComponent } from './shared/new-version/new-version.component';
import { VersionedFolderComponent } from './versioned-folder/versioned-folder/versioned-folder.component';
import { MergeDiffContainerComponent } from './merge-diff/merge-diff-container/merge-diff-container.component';
import { OpenIdConnectAuthorizeComponent } from './security/open-id-connect-authorize/open-id-connect-authorize.component';
import { DoiRedirectComponent } from './doi-redirect/doi-redirect.component';
import { SecurityHandlerService, SharedService } from './services';
import { BulkEditContainerComponent } from './bulk-edit/bulk-edit-container/bulk-edit-container.component';
import { TerminologyMainComponent } from './wizards/terminology/terminology-main/terminology-main.component';
import { CatalogueSearchComponent } from './catalogue-search/catalogue-search/catalogue-search.component';
import { FeaturesService } from './services/features.service';
import { CatalogueSearchListingComponent } from './catalogue-search/catalogue-search-listing/catalogue-search-listing.component';
import { ReferenceDataTypeMainComponent } from './wizards/referenceDataType/reference-data-type-main/reference-data-type-main.component';
import { ReferenceDataModelMainComponent } from './wizards/referenceDataModel/reference-data-model-main/reference-data-model-main.component';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { redirectUsingPath } from './routing.types';
import { CopyActionComponent } from './shared/copy-action/copy-action.component';

/**
 * Collection of all page state routes.
 *
 * To allow anonymous access to a route, add `allowAnonymous: true` to the `data` of a state:
 *
 * @example
 *
 * ```ts
 * states: [
 *  {
 *    name: 'appContainer.mainApp.public',
 *    component: PublicComponent,
 *    url: '/public',
 *    data: {
 *      allowAnonymous: true
 *    }
 *  }
 * ]
 * ```
 */
export const pageRoutes: { states: Ng2StateDeclaration[] } = {
  states: [
    {
      name: 'appContainer',
      component: AppComponent
    },
    {
      name: 'appContainer.mainApp',
      component: AppContainerComponent
    },

    {
      name: 'appContainer.mainApp.about',
      url: '/about',
      component: AboutComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel',
      component: TwoSidePanelComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue',
      url: '/catalogue',
      data: {
        allowAnonymous: true
      },
      views: {
        left: {
          component: ModelsComponent
        },
        '': {
          component: UiViewComponent
        }
      }
    },
    {
      url: '/folder/:id/{tabView:string}?edit',
      name: 'appContainer.mainApp.twoSidePanel.catalogue.folder',
      component: FolderComponent,
      params: { tabView: { value: null, squash: true, dynamic: true } },
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.Folder
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel',
      url: '/dataModel/all',
      component: DataModelDefaultComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.notImplemented',
      url: '/notImplemented',
      component: NotImplementedComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.notAuthorized',
      url: '/notAuthorized',
      component: NotAuthorizedComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.serverError',
      url: '/serverError',
      component: ServerErrorComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.serverTimeout',
      url: '/serverTimeout',
      component: ServerTimeoutComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.notFound',
      url: '/notFound',
      component: NotFoundComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.newVersionModel',
      url: '/:domainType/newVersion/:id',
      component: NewVersionComponent
    },
    {
      name: 'appContainer.mainApp.bulkEdit',
      url: '/:domainType/bulkEdit/:id',
      component: BulkEditContainerComponent
    },
    {
      name: 'appContainer.mainApp.bulkEditDataClass',
      url: '/:domainType/bulkEdit/:dataModelId/:dataClassId/:id',
      component: BulkEditContainerComponent,
      params: {
        dataClassId: null
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataModel',
      url: '/dataModel/:id/{tabView:string}?{finalised:string}',
      component: DataModelComponent,
      params: {
        tabView: { dynamic: true, value: null, squash: true },
        finalised: { dynamic: true, value: null, squash: true, inherit: false }
      },
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.DataModel
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataModel',
      url: '/dataModelNew/new?parentFolderId&parentDomainType',
      component: DataModelMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.ReferenceDataModel',
      url: '/referenceDataModel/:id/{tabView:string}',
      component: ReferenceDataComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } },
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.ReferenceDataModel
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataClass',
      url:
        '/dataClassNew/new?parentDataModelId&grandParentDataClassId&parentDataClassId',
      component: DataClassMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataType',
      url: '/dataTypeNew/new?parentDataModelId',
      component: DataTypeMainComponent
    },
    {
      name: 'appContainer.mainApp.home',
      url: '/home',
      component: HomeComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.default',
      url: '',
      component: HomeComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.openIdConnectAuthorizing',
      url: '/open-id-connect/authorize',
      component: OpenIdConnectAuthorizeComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.doiRedirect',
      url: '/doi/:id',
      component: DoiRedirectComponent,
      params: {
        id: {
          type: 'string',
          raw: true
        }
      },
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewTerminology',
      url: '/terminology/new?parentFolderId&parentDomainType',
      component: TerminologyMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.terminology',
      url: '/terminology/:id/{tabView:string}',
      component: TerminologyComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } },
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.Terminology
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataClass',
      url: '/dataClass/:dataModelId/:dataClassId/:id/{tabView:string}',
      component: DataClassComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } },
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.DataClass
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataElement',
      url:
        '/dataElement/:dataModelId/:dataClassId/:id/{tabView:string}?parentId',
      params: { tabView: { dynamic: true, value: null, squash: true } },
      component: DataElementComponent,
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.DataElement
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.classification',
      url: '/classification/:id/{tabView:string}',
      component: ClassificationComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } },
      data: {
        allowAnonymous: true,
        domainType: 'Classifier' // Must make sure starts with uppercase character
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.import',
      url: '/import/:importType',
      component: ImportModelsComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.export',
      url: '/export/:exportType',
      component: ExportModelsComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataElement',
      url:
        '/dataElement/new?parentDataModelId&grandParentDataClassId&parentDataClassId',
      component: DataElementMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataType',
      url: '/dataType/:dataModelId/:id/{tabView:string}',
      component: DataTypeComponent,
      params: {
        tabView: { dynamic: true, value: null, squash: true }
      },
      data: {
        allowAnonymous: true,
        domainTypes: [
          CatalogueItemDomainType.CodeSetType,
          CatalogueItemDomainType.ModelDataType,
          CatalogueItemDomainType.PrimitiveType,
          CatalogueItemDomainType.ReferenceType,
          CatalogueItemDomainType.EnumerationType,
          CatalogueItemDomainType.TerminologyType,
          CatalogueItemDomainType.ReferenceDataModelType
        ]
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.enumerationValues',
      url: '/enumerationType/:dataModelId/:dataTypeId/:id/{tabView:string}',
      component: EnumerationValuesComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } }
    },
    {
      name: 'appContainer.mainApp.resetPassword',
      url: '/resetpassword?uid&token',
      component: ResetPasswordComponent,
      data: {
        allowAnonymous: true
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.term',
      url: '/term/:terminologyId/:id/{tabView:string}',
      component: TermComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } },
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.Term
      }
    },
    {
      name: 'appContainer.mainApp.linkSuggestion',
      url: '/linkSuggestion/:sourceDMId?&targetDMId&sourceDCId&sourceDEId',
      component: LinkSuggestionComponent
    },
    {
      name: 'appContainer.mainApp.modelsComparison',
      url: '/modelsComparison/:sourceId/:targetId',
      component: ModelComparisonComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.modelsMergingGraph',
      url: '/modelsMergingGraph/:modelType/:modelId',
      component: ModelsMergingGraphComponent
    },
    {
      name: 'appContainer.mainApp.mergeDiff',
      url: '/mergeDiff/:catalogueDomainType/:sourceId/:targetId',
      component: MergeDiffContainerComponent,
      params: {
        targetId: null
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewCodeSet',
      url: '/codeSet/new?parentFolderId&parentDomainType',
      component: CodeSetMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.codeSet',
      url: '/codeSet/:id/{tabView:string}',
      component: CodeSetComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } },
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.CodeSet
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.subscribedCatalogue',
      url: '/subscribedCatalogue/:id/{tabView:string}',
      component: SubscribedCatalogueMainComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.federatedDataModel',
      url:
        '/subscribedCatalogue/:parentId/federatedDataModel/:id/{tabView:string}',
      component: FederatedDataModelMainComponent,
      params: {
        tabView: { dynamic: true, value: null, squash: true },
        dataModel: null
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.versionedFolder',
      url: '/versionedFolder/:id/{tabView:string}',
      component: VersionedFolderComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } },
      data: {
        allowAnonymous: true,
        domainType: CatalogueItemDomainType.VersionedFolder
      }
    },
    {
      name: 'appContainer.mainApp.catalogueSearch',
      url: '/search',
      component: CatalogueSearchComponent,
      data: {
        allowAnonymous: true,
        featureSwitch: 'useCatalogueSearch'
      }
    },
    {
      name: 'appContainer.mainApp.catalogueSearchListing',
      // For search URL, compress the parameter names as much as possible - metadata (md) query param value could be very long
      url:
        '/search/listing?{cxdt:string}&{cxid:string}&{cxl:string}&{cxpid:string}&{cxmid:string}&{search:string}&{page:int}&{sort:string}&{order:string}&{pageSize:int}&{dt:string}&{l:bool}&{e:bool}&{lua:string}&{lub:string}&{ca:string}&{cb:string}&{cls:string}&{md:string}',
      component: CatalogueSearchListingComponent,
      data: {
        allowAnonymous: true
      },
      params: {
        cxdt: null, // contextDomainType: string
        cxid: null, // contextId: string
        cxl: null, // contextLabel: string
        cxpid: null, // contextParentId: string
        cxmid: null, // contextDataModelId: string
        search: null,
        page: null,
        sort: null,
        order: null,
        pageSize: null,
        l: false, // labelOnly: bool
        e: false, // exactMatch: bool
        dt: {
          // domain types: array
          array: 'auto'
        },
        cls: {
          // classifiers: array
          array: 'auto'
        },
        lua: null, // lastUpdatedAfter: string (date)
        lub: null, // lastUpdatedBefore: string (date)
        ca: null, // createdAfter: string (date)
        cb: null, // createdBefore: string (date)
        is: false, // includeSuperseded: bool
        md: null // metadata: base64 encoded string
      }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewReferenceDataModel',
      url: '/referenceDataModel/new?parentFolderId&parentDomainType',
      component: ReferenceDataModelMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewReferenceDataType',
      url: '/referenceDataType/new?parentModelId',
      component: ReferenceDataTypeMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.containerCopy',
      url: '/:domainType/copy/:id/',
      component: CopyActionComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataElementCopy',
      url: '/:domainType/:dataModelId/:dataClassId/copy/:id/',
      component: CopyActionComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataClassCopy',
      url: '/:domainType/:dataModelId/copy/:id/',
      component: CopyActionComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.termCopy',
      url: '/:domainType/:terminologyId/copy/:id/',
      component: CopyActionComponent
    },
    {
      /**
       * Catch-all URL to automatically redirect to the correct router state to show this item.
       *
       * Item is defined by a top-level domain and a Mauro path syntax, which will be located and then
       * redirected to.
       */
      name: 'appContainer.mainApp.twoSidePanel.catalogue.catalogueItem',
      url: '/item/{domain:string}/{path:string}?{finalised:bool}',
      params: {
        finalised: false
      },
      redirectTo: redirectUsingPath
    }
  ]
};

/**
 * Router transition hook to check editing state of app before switching views
 */
const editingViewTransitionHooks = (
  transitions: TransitionService,
  editing: EditingService
) => {
  /**
   * Check each state transition where the "from" view state is marked as editable.
   */
  const canLeaveStateCriteria = {
    from: (state: StateObject) =>
      state.name && editing.isRouteEditable(state.name)
  };

  /**
   * Check a state transition by checking if any unsaved edits still exist. If so, confirm with the user whether to continue.
   */
  const canLeaveStateAction = () => editing.confirmLeaveAsync().toPromise();

  /**
   * When entering each view, ensure that the global editing state of the app is reset.
   */
  const onEnteringViewAction = () => editing.stop();

  transitions.onBefore(canLeaveStateCriteria, canLeaveStateAction);
  transitions.onEnter({}, onEnteringViewAction);
};

/**
 * Router transition hooks for checking role access before switching views.
 *
 * @see {@link StateRoleAccessService}
 */
const roleTransitionHooks = (transitions: TransitionService) => {
  /**
   * Before starting a transition, check if the user/role has access to this route.
   */
  const canAccessRoute = (transition: Transition): HookResult => {
    const securityHandler = transition
      .injector()
      .get<SecurityHandlerService>(SecurityHandlerService);
    const shared = transition.injector().get<SharedService>(SharedService);
    const state = transition.$to();
    shared.current = state.name;

    if (state.data?.allowAnonymous) {
      return true;
    }

    return securityHandler.isLoggedIn();
  };

  /**
   * Before starting a transition, check if the route is locked behind a feature switch.
   */
  const isRouteFeatureSwitchEnabled = (transition: Transition): HookResult => {
    const features = transition
      .injector()
      .get<FeaturesService>(FeaturesService);
    const state = transition.$to();
    const featureSwitchName = state.data?.featureSwitch;

    if (!featureSwitchName) {
      // Not blocked by feature switch, continue as normal
      return true;
    }

    const enabled: boolean = features[featureSwitchName];
    return enabled;
  };

  transitions.onStart({}, canAccessRoute);
  transitions.onStart({}, isRouteFeatureSwitchEnabled);
};

/**
 * Configuration of the `UIRouter`.
 */
const routerConfigFn = (router: UIRouter, injector: Injector) => {
  const transitions = router.transitionService;

  const editing = injector.get<EditingService>(EditingService);

  editingViewTransitionHooks(transitions, editing);
  roleTransitionHooks(transitions);
};

@NgModule({
  imports: [
    UIRouterModule.forChild({
      states: pageRoutes.states,
      config: routerConfigFn
    })
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ]
})
export class AppRoutingModule {
  constructor() {}
}
