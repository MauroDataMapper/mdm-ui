import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MultiFacetAwareDomainType, CatalogueItemDomainType, Uuid, MultiFacetAwareItem } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService, MessageHandlerService, BroadcastService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { BulkEditContext, BulkEditProfileContext } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-container',
  templateUrl: './bulk-edit-container.component.html',
  styleUrls: ['./bulk-edit-container.component.scss']
})
export class BulkEditContainerComponent implements OnInit {
  context: BulkEditContext;
  catalogueItemId: Uuid;
  domainType: CatalogueItemDomainType | MultiFacetAwareDomainType;

  profileSelectStep = false;
  elementSelectStep = true;
  editorStep = false;
  tabs: BulkEditProfileContext[];

  constructor(
    private dialog: MatDialog,
    private stateHandler: StateHandlerService,
    private resouce: MdmResourcesService,
    private broadcast: BroadcastService,
    private uiRouterGlobals: UIRouterGlobals,
    private messageHandler: MessageHandlerService) { }

  ngOnInit(): void {
    this.context = {
      elements: [],
      profiles: []
    };
    this.catalogueItemId = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;
  }

  openEditor() {
    this.profileSelectStep = false;
    this.editorStep = true;
    if (this.editorStep) {
      this.buildTabs();
    }
  }

  openProfile() {
    this.profileSelectStep = true;
    this.editorStep = false;
    this.elementSelectStep = false;
  }

  openElement() {
    this.profileSelectStep = false;
    this.editorStep = false;
    this.elementSelectStep = true;
  }

  cancel() {
    this.stateHandler.GoPrevious();
  }

  validate() {
    this.broadcast.dispatch('validateBulkEdit');
  }

  buildTabs() {
    this.tabs = this.context.profiles.map<BulkEditProfileContext>(profile => {
      const multiFacetAwareItems = this.context.elements.map<MultiFacetAwareItem>(element => {
        return {
          multiFacetAwareItemDomainType: element.domainType,
          multiFacetAwareItemId: element.id
        }
      });

      return {
        tabTitle: profile.displayName,
        profile,
        multiFacetAwareItems,
        editedProfiles: null
      };
    });
  }

  save() {
    const profiles: Array<any> = [];

    this.tabs.forEach((tab) => {
      profiles.push(...tab.editedProfiles.profilesProvided);
    });

    this.resouce.profile
      .saveMany(
        this.domainType,
        this.catalogueItemId,
        { profilesProvided: profiles })
      .pipe(
        catchError(error => {
          this.messageHandler.showError(error);
          return EMPTY;
        }),
        switchMap(() => {
          return this.dialog.openConfirmationAsync({
            data: {
              title: 'Close bulk editor?',
              okBtnTitle: 'Yes',
              cancelBtnTitle: 'No',
              btnType: 'primary',
              message: '<b>Save Successful</b>, do you want to close the bulk editor?',
            }
          });
        })
      )
      .subscribe(() => {
        // Chosen to close the editor and go back
        this.cancel();
      });
  }
}
