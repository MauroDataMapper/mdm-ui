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
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MessageHandlerService, SecurityHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import {
  CodeSetDetail,
  CodeSetDetailResponse,
  ModelUpdatePayload,
  SecurableDomainType
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { TabCollection } from '@mdm/model/ui.model';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { catchError } from 'rxjs/operators';
import { BaseComponent } from '@mdm/shared/base/base.component';

@Component({
  selector: 'mdm-code-set',
  templateUrl: './code-set.component.html',
  styleUrls: ['./code-set.component.scss']
})
export class CodeSetComponent
  extends BaseComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  codeSetModel: CodeSetDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  editMode = false;
  showExtraTabs = false;
  activeTab: number;
  dataModel4Diagram: any;
  cells: any;
  rootCell: any;
  semanticLinks: any[] = [];
  descriptionView = 'default';
  annotationsView = 'default';
  compareToList = [];
  rulesItemCount = 0;
  isLoadingRules = true;
  termsItemCount = 0;
  isLoadingTerms = true;
  showEdit: boolean;
  showDelete: boolean;
  canEditDescription: boolean;
  showEditDescription = false;
  access: Access;
  tabs = new TabCollection(['description', 'terms', 'links', 'rules', 'annotations', 'history']);

  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService,
    private title: Title,
    private dialog: MatDialog,
    private messageHandler: MessageHandlerService,
    private editingService: EditingService,
    private securityHandler: SecurityHandlerService
  ) {
    super();
  }

  ngOnInit() {
    if (!this.uiRouterGlobals.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.uiRouterGlobals.params.edit === 'true') {
      this.editMode = true;
    }

    this.parentId = this.uiRouterGlobals.params.id;

    this.title.setTitle('Code Set');
    this.codeSetDetails(this.parentId);

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  codeSetDetails(id: string) {
    let arr = [];
    this.resourcesService.codeSet
      .get(id)
      .subscribe(async (result: CodeSetDetailResponse) => {
        // Get the guid
        this.codeSetModel = result.body;
        // this.parentId = this.codeSetModel.id;
        this.catalogueItem = this.codeSetModel;

        this.access = this.securityHandler.elementAccess(this.codeSetModel);
        this.showEdit = this.access.showEdit;

        await this.resourcesService.versionLink
          .list('codeSets', this.codeSetModel.id)
          .subscribe((response) => {
            if (response.body.count > 0) {
              arr = response.body.items;
              for (const val in arr) {
                if (this.codeSetModel.id !== arr[val].targetModel.id) {
                  this.semanticLinks.push(arr[val]);
                }
              }
            }
          });

        this.showExtraTabs =
          !this.sharedService.isLoggedIn() ||
          !this.codeSetModel.editable ||
          this.codeSetModel.finalised;

        if (this.sharedService.isLoggedIn(true)) {
          this.CodeSetPermissions();
        }

        this.tabGroup?.realignInkBar();
        this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView as string).index;
        this.tabSelected(this.activeTab);
      });
  }


  CodeSetPermissions() {
    this.resourcesService.security
      .permissions(SecurableDomainType.CodeSets, this.codeSetModel.id)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
        Object.keys(permissions.body).forEach((attrname) => {
          this.codeSetModel[attrname] = permissions.body[attrname];
        });
      });
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  ngOnDestroy() {
    if (this.subscription) {
      // unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
    }
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go(
      'codeSet',
      { tabView: tab.name },
      { notify: false }
    );
  }

  rulesCountEmitter($event) {
    this.isLoadingRules = false;
    this.rulesItemCount = $event;
  }

  termsCountEmitter($event) {
    this.isLoadingTerms = false;
    this.termsItemCount = $event;
  }

  watchDataModelObject() {
    const access: Access = this.securityHandler.elementAccess(this.codeSetModel);
    if (access !== undefined) {
      this.showEdit = access.showEdit;
      this.canEditDescription = access.canEditDescription;
      this.showDelete = access.showPermanentDelete || access.showSoftDelete;
    }
  }

  save(saveItems: Array<DefaultProfileItem>) {
    const resource: ModelUpdatePayload = {
      id: this.codeSetModel.id,
      domainType: this.codeSetModel.domainType
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      resource[item.propertyName] = item.value;
    });

     this.resourcesService.codeSet
    .update(this.codeSetModel.id, resource)
    .pipe( catchError(error =>
      {
        this.messageHandler.showError(  'There was a problem updating the Code Set.',   error );
        return EMPTY ;
      }))
    .subscribe(
      (res) => {
        this.editingService.stop();
        this.messageHandler.showSuccess('Code Set updated successfully.');
        this.catalogueItem = res.body;
        this.codeSetModel = res.body;
      }
    );

  }
}
