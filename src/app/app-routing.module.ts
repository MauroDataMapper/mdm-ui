import { NgModule } from '@angular/core';
import { AboutComponent } from './about/about.component';

// import { DataModelDetailComponent } from './dataModel/data-model-detail.component';
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
import { ImportComponent } from './import/import.component';
import { SearchComponent } from './search/search.component';
import { TerminologyComponent } from './terminology/terminology.component';
import { TwoSidePanelComponent } from './two-side-panel/two-side-panel.component';
import {  UIRouterModule} from '@uirouter/angular';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { UiViewComponent } from './shared/ui-view/ui-view.component';
import { ModelsComponent } from './shared/models/models.component';
import { DataModelComponent } from './dataModel/data-model.component';
import { DataClassComponent } from './dataClass/data-class/data-class.component';
import { DataElementComponent } from './dataElement/data-element/data-element.component';
import { ClassificationComponent } from './classification/classification.component';
import { ClassifierMainComponent } from './wizards/classifier/classifier-main/classifier-main.component';
import { DiagramComponent } from './diagram/diagram.component';
import { AppContainerComponent } from './app-container/app-container.component';
import { AppComponent } from './app.component';

import { ConfigurationComponent } from './admin/configuration/configuration.component';
import { DataModelsExportComponent } from './data-models-export/data-models-export.component';
import { DataElementMainComponent } from './wizards/dataElement/data-element-main/data-element-main.component';
import { DataTypeComponent } from './data-type/data-type.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import {TermComponent} from './term/term/term.component';
import { LinkSuggestionComponent } from './link-suggestion/link-suggestion.component';
import { ModelComparisonComponent } from './model-comparison/model-comparison.component';
import {CodeSetMainComponent} from './wizards/codeSet/code-set-main/code-set-main.component';

export const PagesRoutes = {
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
      name: 'appContainer.mainApp.diagram',
      url: '/diagram/:id',
      component: DiagramComponent
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
      name: 'appContainer.mainApp.twoSidePanel.catalogue.resourceNotFound',
      url: '/resourceNotFound',
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
      params: { tabView: { dynamic: true, value: null, squash: true } }
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewDataModel',
      url: '/dataModelNew/new?parentFolderId',
      component: DataModelMainComponent
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
      name: 'appContainer.mainApp.twoSidePanel.catalogue.import',
      url: '/import',
      component: ImportComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.search',
      url: '/search',
      component: SearchComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.terminology',
      url: '/terminologyNew/:id/{tabView:string}',
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
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewClassifier',
      url: '/classifier/new?parentId',
      component: ClassifierMainComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.dataModelsExport',
      url: '/dataModelsExport',
      component: DataModelsExportComponent
    },
    {
        name:'appContainer.mainApp.twoSidePanel.catalogue.NewDataElement',
        url: '/dataElement/new?parentDataModelId&grandParentDataClassId&parentDataClassId',
        component: DataElementMainComponent
    },
    {
      name :'appContainer.mainApp.twoSidePanel.catalogue.dataType',
      url: '/dataType/:dataModelId/:id/{tabView:string}',
      component : DataTypeComponent,
      params: {
        tabView: { dynamic: true, value: null, squash: true }
    }},
    {
      name:'appContainer.mainApp.resetPassword',
      url: '/resetpassword?uid&token',
      component: ResetPasswordComponent
    },
    {
      name:'appContainer.mainApp.twoSidePanel.catalogue.term',
      url: '/term/:terminologyId/:id/{tabView:string}',
      component: TermComponent,
      params: { tabView: { dynamic: true, value: null, squash: true } }
    },
    {
      name:'appContainer.mainApp.linkSuggestion',
      url: '/linkSuggestion/:sourceDMId?&targetDMId&sourceDCId&sourceDEId',
      component: LinkSuggestionComponent
    },
    {
      name:'appContainer.mainApp.modelsComparison',
      url: '/modelsComparison/:sourceId/:targetId',
      component: ModelComparisonComponent
    },
    {
      name: 'appContainer.mainApp.twoSidePanel.catalogue.NewCodeSet',
      url: '/codeSet/new?parentFolderId',
      component: CodeSetMainComponent
    }

  ]
};

@NgModule({
  imports: [UIRouterModule.forChild({ states: PagesRoutes.states })],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ]
})
export class AppRoutingModule {
  constructor() {
    // this.stateRoleAccessService.add("appContainer", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.about", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.home", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.default", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.register", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.resetPassword", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.about", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.allDataModel", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.home", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.result", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.filter", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.submission", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.element", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.notImplemented", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.serverError", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.resourceNotFound", ['public']);
    // this.stateRoleAccessService.add("appContainer.simpleApp.notAuthorized", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.dataType", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.dataModel", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.codeSet", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.terminology", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.term", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.dataElement", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.dataClass", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.selection", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.classification", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.resourceNotFound", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.serverError", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.notImplemented", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.notAuthorized", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.search", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.folder", ['public']);
    // this.stateRoleAccessService.add("otherwise", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.newVersionDataModel", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.newVersionTerminology", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.userArea", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.userArea.profile", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.userArea.changePassword", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.userArea.settings", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.diagram", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.dataFlowTransformation", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.dataFlowDM2DM", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.dataFlowChain", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.topicView", ['public']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataModel", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataElement", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataClass", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.NewDataType", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.NewClassifier", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.NewCodeSet", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.adminArea", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.users", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.user", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.groups", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.group", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.pendingUsers", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.configuration", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.home", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.resourceNotFound", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.emails", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.adminArea.modelManagement", ['Administrator']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.import", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.twoSidePanel.catalogue.dataModelsExport", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.modelsComparison", ['Administrator', 'Editor']);
    // this.stateRoleAccessService.add("appContainer.mainApp.linkSuggestion", ['Administrator', 'Editor']);
  }
}
