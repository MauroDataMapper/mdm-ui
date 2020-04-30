import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  forwardRef,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription, forkJoin } from 'rxjs';
import { ResourcesService } from '@mdm/services/resources.service';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { TermResult } from '@mdm/model/termModel';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'mdm-term',
  templateUrl: './term.component.html',
  styleUrls: ['./term.component.scss']
})
export class TermComponent implements OnInit {
  constructor(
    private resources: ResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private broadcast: BroadcastService,
    private changeRef: ChangeDetectorRef
  ) {}
  terminology = null;
  term: TermResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  result: TermResult;
  hasResult = false;

  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;

  // tabSelected  (itemsName) {
  //   var tab = getTabDetail(itemsName);
  //   stateHandler.Go("term", {tabView: itemsName}, {notify: false, location: tab.index !== 0});
  //   $scope[itemsName] = [];
  //
  //   this.activeTab = getTabDetail(itemsName);
  //
  //   if (this.activeTab && this.activeTab.fetchUrl) {
  //     $scope[$scope.activeTab.name] = [];
  //     this.loadingData = true;
  //     this.resources.terminology.get($stateParams.terminologyId, $scope.activeTab.fetchUrl).then(function (data) {
  //       $scope[$scope.activeTab.name] = data || [];
  //       this.loadingData = false;
  //     });
  //   }
  // };

  showEditForm = false;
  editForm = null;

  ngOnInit() {
    if (!this.stateService.params.id) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }

    this.parentId = this.stateService.params.id;

    window.document.title = 'Term';

    this.termDetails(this.stateService.params.id);

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );
    this.afterSave = (result: { body: { id: any } }) =>
      this.termDetails(result.body.id);
  }

  termDetails = id => {
    const terms = [];
    terms.push(
      this.resources.terminology.get(
        this.stateService.params.terminologyId,
        null
      )
    );
    terms.push(
      this.resources.term.get(
        this.stateService.params.terminologyId,
        this.stateService.params.id,
        null
      )
    );
    terms.push(
      this.resources.term.get(
        this.stateService.params.terminologyId,
        this.stateService.params.id,
        'semanticLinks'
      )
    );

    forkJoin(terms).subscribe((results: any) => {
      this.terminology = results[0].body;
      this.term = results[1].body;
      this.term.semanticLinks = results[2].body.items;

      this.term.finalised = this.terminology.finalised;
      this.term.editable = this.terminology.editable;

      this.term.classifiers = this.term.classifiers || [];
      this.term.terminology = this.terminology;
      this.activeTab = this.getTabDetailByName(
        this.stateService.params.tabView
      );
      this.result = this.term;
      if (this.result.terminology) { this.hasResult = true; }
      // this.result.terminology = this.terminology.terminology;
      // this.result.terminologyLabel =  this.terminology.terminologyLabel;
      this.messageService.FolderSendMessage(this.result);
      this.messageService.dataChanged(this.result);
      this.changeRef.detectChanges();
    });

    // this.tabGroup.realignInkBar();
    this.activeTab = this.getTabDetailByName(
      this.stateService.params.tabView
    ).index;
    this.tabSelected(this.activeTab);
  };

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'properties':
        return { index: 0, name: 'properties' };
      case 'comments':
        return { index: 1, name: 'comments' };
      case 'links':
        return { index: 2, name: 'links' };
      case 'attachments':
        return { index: 3, name: 'attachments' };

      default:
        return { index: 0, name: 'properties' };
    }
  }

  Save(updatedResource) {
    this.broadcast.broadcast('$elementDetailsUpdated', updatedResource);
  }
  openEditForm = function(formName) {
    this.showEditForm = true;
    this.editForm = formName;
  };

  closeEditForm = function() {
    this.showEditForm = false;
    this.editForm = null;
  };

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'properties' };
      case 1:
        return { index: 1, name: 'comments' };
      case 2:
        return { index: 2, name: 'links' };
      case 3:
        return { index: 3, name: 'attachments' };
      default:
        return { index: 0, name: 'properties' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'term',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this.activeTab = tab.index;
  }
}
