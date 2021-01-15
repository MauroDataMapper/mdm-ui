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
import { NgModule } from '@angular/core';
import { AboutComponent } from './about/about.component';
import { FolderComponent } from './folder/folder.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { DataModelDefaultComponent } from './utility/data-model-default.component';
import { NotImplementedComponent } from './errors/not-implemented/not-implemented.component';
import { NotAuthorizedComponent } from './errors/not-authorized/not-authorized.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { NewVersionDataModelComponent } from './dataModel/new-version-data-model/new-version-data-model.component';
import { DataModelMainComponent } from './wizards/dataModel/data-model-main/data-model-main.component';
import { DataClassMainComponent } from './wizards/dataClass/data-class-main/data-class-main.component';
import { DataTypeMainComponent } from './wizards/dataType/data-type-main/data-type-main.component';
import { HomeComponent } from './home/home.component';
import { ImportModelsComponent } from './import-models/import-models.component';
import { SearchComponent } from './search/search.component';
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
import { NewVersionCodeSetComponent } from '@mdm/code-set/new-version-code-set/new-version-code-set.component';
import { ModelMergingComponent } from './model-merging/model-merging.component';
import { ModelsMergingGraphComponent } from './models-merging-graph/models-merging-graph.component';
import { EnumerationValuesComponent } from '@mdm/enumerationValues/enumeration-values/enumeration-values.component';
import { StateDeclaration, Transition, TransitionService, UIRouter } from '@uirouter/core';
import { EditingService } from './editing/editing.service';


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
      component: AboutComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel',
      component: TwoSidePanelComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue',
      url: '/catalogue',
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
      name: 'appContainer.mainApp.twoSidePanel.catalogue.folder',
      url: '/folder/:id/{tabView:string}?edit',
      component: FolderComponent,
      params: { tabView: { value: null, squash: true, dynamic: true } }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.allDataModel',
      url: '/dataModel/all',
      component: DataModelDefaultComponent
      // params: { hideExpandBtn: true }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.notImplemented',
      url: '/notImplemented',
      component: NotImplementedComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.notAuthorized',
      url: '/notAuthorized',
      component: NotAuthorizedComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.serverError',
      url: '/serverError',
      component: ServerErrorComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.notFound',
      url: '/notFound',
      component: NotFoundComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.newVersionDataModel',
      url: '/newVersion/dataModel/:dataModelId',
      component: NewVersionDataModelComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataModel',
      url: '/dataModel/:id/{tabView:string}',
      component: DataModelComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } },
      data: { isEditable: true }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataModel',
      url: '/dataModelNew/new?parentFolderId',
      component: DataModelMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.ReferenceDataModel',
      url: '/referenceDataModel/:id/{tabView:string}',
      component: ReferenceDataComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } }
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
      component: HomeComponent
    },
    {
      name: 'appContainer.mainApp.default',
      url: '',
      component: HomeComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.search',
      url: '/search',
      component: SearchComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.terminology',
      url: '/terminology/:id/{tabView:string}',
      component: TerminologyComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataClass',
      url: '/dataClass/:dataModelId/:dataClassId/:id/{tabView:string}',
      component: DataClassComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataElement',
      url:
        '/dataElement/:dataModelId/:dataClassId/:id/{tabView:string}?parentId',
      params: { tabView: { dynamic: true, value: null, squash: true } },
      component: DataElementComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.classification',
      url: '/classification/:id/{tabView:string}',
      component: ClassificationComponent,
      params: {
        tabView: ''
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
      url: '/dataElement/new?parentDataModelId&grandParentDataClassId&parentDataClassId',
      component: DataElementMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataType',
      url: '/dataType/:dataModelId/:id/{tabView:string}',
      component: DataTypeComponent,
      params: {
        tabView: { dynamic: true, value: null, squash: true }
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
      component: ResetPasswordComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.term',
      url: '/term/:terminologyId/:id/{tabView:string}',
      component: TermComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } }
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
      name: 'appContainer.mainApp.modelsMerging',
      url: '/modelsMerging/:sourceId/:targetId',
      component: ModelMergingComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.modelsMergingGraph',
      url: '/modelsMergingGraph/:modelType/:modelId',
      component: ModelsMergingGraphComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewCodeSet',
      url: '/codeSet/new?parentFolderId',
      component: CodeSetMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.codeSet',
      url: '/codeSet/:id/{tabView:string}',
      component: CodeSetComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } }

    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.newVersionCodeSet',
      url: '/newVersion/codeSet/:codeSetId',
      component: NewVersionCodeSetComponent
    },


  ]
};

/**
 * Router transition hook to check editing state of app before switching views
 */
function editingViewTransitionHooks(transitionService: TransitionService) {

  /**
   * Check each state transition where the "from" view state is marked as editable.
   */
  const canLeaveStateCriteria = {
    from: (state) => state.data && state.data.isEditable
  };

  /**
   * Check a state transition by checking if any unsaved edits still exist. If so, confirm with the user whether to continue.
   */
  const canLeaveStateAction = (transition: Transition) => {
    const editingService = transition.injector().get<EditingService>(EditingService);

    let leave = true;
    if (editingService && editingService.isEditing) {
      leave = confirm("Are you sure you want to leave this view? Any unsaved changes will be lost.");
    }    

    return leave;
  };

  /**
   * When entering each view, ensure that the global editing state of the app is reset.
   */
  const onEnteringViewAction = (transition: Transition, state: StateDeclaration) => {
    const editingService = transition.injector().get<EditingService>(EditingService);
    editingService.isEditing = false;
  };

  transitionService.onBefore(canLeaveStateCriteria, canLeaveStateAction);
  transitionService.onEnter({}, onEnteringViewAction);
}

function routerConfigFn(router: UIRouter) {
  const transitionService = router.transitionService;
  editingViewTransitionHooks(transitionService);
}

@NgModule({
  imports: [UIRouterModule.forChild({ 
    states: pageRoutes.states,
    config: routerConfigFn
  })],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ]
})
export class AppRoutingModule {
  constructor() { }
}
