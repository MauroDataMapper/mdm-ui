import {Component, OnInit, Input, ViewChildren, QueryList, ContentChildren, OnDestroy} from '@angular/core';
import { MarkdownTextAreaComponent } from '../utility/markdown-text-area.component';
import { FolderResult } from '../model/folderModel';
import { Subscription, forkJoin } from 'rxjs';
import { ResourcesService } from '../services/resources.service';
import { MessageService } from '../services/message.service';
import { SharedService } from '../services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '../services/handlers/state-handler.service';

@Component({
  selector: 'mdm-classification',
  templateUrl: './classification.component.html',
  styleUrls: ['./classification.component.sass']
})
export class ClassificationComponent implements OnInit, OnDestroy {
  @Input('after-save') afterSave: any;
  @Input() editMode = false;

  @ViewChildren('editableText') editForm: QueryList<any>;
  @ContentChildren(MarkdownTextAreaComponent) editForm1: QueryList<any>;
  @Input() mcClassification;
  classifier = null;

  result: FolderResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  activeTab: any;
  catalogueItemsCount: any;
  terminologiesCount: any;
  termsCount: any;
  codeSetsCount: any;
  loading = false;
  catalogueItems: any;

  constructor(
    private resourcesService: ResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService
  ) {
    // this.toaster.success('toast test');
  }

  ngOnInit() {
    if (!this.stateService.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }

    // if(this.stateService.params.edit === "true"){ //Call this if using message service.
    //     // this.editMode = true;
    //     this.messageService.showEditMode(true);
    // }
    // else
    //     this.messageService.showEditMode(false);
    window.document.title = 'Classifier';
    this.classifierDetails(this.stateService.params.id);

    const promises = [];
    promises.push(
      this.resourcesService.classifier.get(
        this.stateService.params.id,
        'catalogueItems',
        null
      )
    );
    promises.push(
      this.resourcesService.classifier.get(
        this.stateService.params.id,
        'terminologies',
        null
      )
    );
    promises.push(
      this.resourcesService.classifier.get(
        this.stateService.params.id,
        'terms',
        null
      )
    );
    promises.push(
      this.resourcesService.classifier.get(
        this.stateService.params.id,
        'codeSets',
        null
      )
    );

    forkJoin(promises).subscribe((results: any) => {
      this.catalogueItemsCount = results[0].count;
      this.terminologiesCount = results[1].count;
      this.termsCount = results[2].count;
      this.codeSetsCount = results[3].count;

      this.loading = false;
      this.activeTab = this.getTabDetail('classifiedElements');
    });

    this.subscription = this.messageService.changeUserGroupAccess.subscribe(
      (message: boolean) => {
        this.showSecuritySection = message;
      }
    );
    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
    this.afterSave = (result: { body: { id: any } }) =>
      this.classifierDetails(result.body.id);

    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView);
  }

  classifierDetails(id: any) {
    this.resourcesService.classifier
      .get(id, null, null)
      .subscribe((result: { body: FolderResult }) => {
        this.result = result.body;

        this.parentId = this.result.id;
        if (this.sharedService.isLoggedIn) {
          this.classifierPermissions(id);
        }
      });
  }
  classifierPermissions(id: any) {
    this.resourcesService.classifier
      .get(id, 'permissions', null)
      .subscribe((permissions: { body: { [x: string]: any } }) => {
        Object.keys(permissions.body).forEach(attrname => {
          this.result[attrname] = permissions.body[attrname];
        });
        // Send it to message service to receive in child components
        this.messageService.FolderSendMessage(this.result);
        this.messageService.dataChanged(this.result);
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

  tabSelected(itemsName) {
    const tab = this.getTabDetail(itemsName);
    // this.stateHandler.Go("folder", { tabView: tab.name }, { notify: false, location: tab.index !== 0 });
  }

  getTabDetail(tabIndex) {
    switch (tabIndex) {
      case 0:
        return { index: 0, name: 'access' };
      case 1:
        return { index: 1, name: 'history' };
      default:
        return { index: 0, name: 'access' };
    }
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'classifiedElements':
        return { index: 0, name: 'classifiedElements' };
      case 'classifiedTerminologies':
        return { index: 1, name: 'classifiedTerminologies' };
      case 'classifiedTerms':
        return { index: 2, name: 'classifiedTerms' };
      case 'classifiedCodeSets':
        return { index: 3, name: 'classifiedCodeSets' };
      case 'history': {
        let index = 4;
        if (this.terminologiesCount === 0) {
          index--;
        }
        if (this.termsCount === 0) {
          index--;
        }
        if (this.codeSetsCount === 0) {
          index--;
        }
        return { index, name: 'history' };
      }
    }
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'classifiedElements' };
      case 1:
        return { index: 1, name: 'classifiedTerminologies' };
      case 2:
        return { index: 2, name: 'classifiedTerms' };
      case 3:
        return { index: 3, name: 'classifiedCodeSets' };
      case 4:
        return { index: 4, name: 'history' };
      default:
        return { index: 0, name: 'classifiedElements' };
    }
  }
}
