import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MultiFacetAwareDomainType, CatalogueItemDomainType, Uuid, Profile } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService, MessageHandlerService, BroadcastService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditPayload } from '../model/bulkEditPayload';

@Component({
  selector: 'mdm-bulk-edit-base',
  templateUrl: './bulk-edit-base.component.html',
  styleUrls: ['./bulk-edit-base.component.scss']
})
export class BulkEditBaseComponent implements OnInit {

  @Output() bulkEditPayloadChanged = new EventEmitter<BulkEditPayload>();

  bulkEditPayload: BulkEditPayload;
  catalogueItemId: Uuid;
  domainType: CatalogueItemDomainType | MultiFacetAwareDomainType;

  profileSelectStep = false;
  elementSelectStep = true;
  editorStep = false;
  tabs : Array<{ tabTitle: string; profile:any; multiFacetAwareItems : Array<{ multiFacetAwareItemDomainType: string; multiFacetAwareItemId: Uuid}>; editedProfiles : { body: { count: number; profilesProvided: [{ profile: Profile; profileProviderService: { namespace: string; name: string } }] } }}>;

  constructor(private dialog: MatDialog, private stateHandler: StateHandlerService, private resouce: MdmResourcesService, private broadcast: BroadcastService,  private uiRouterGlobals: UIRouterGlobals, private messageHandler: MessageHandlerService) { }

  ngOnInit(): void {
    this.bulkEditPayload = { selectedElements: [], selectedProfiles: [] };
    this.catalogueItemId = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;
  }

  openEditor() {
    this.profileSelectStep = false;
    this.editorStep = true;
    if (this.editorStep) {

      // build tabs
      this.buildTabs();
    }
  }

  openProfile()
  {
    this.profileSelectStep = true;
    this.editorStep = false;
    this.elementSelectStep = false;
  }

  
  openElement()
  {
    this.profileSelectStep = false;
    this.editorStep = false;
    this.elementSelectStep = true;
  }


  cancel() {
    this.stateHandler.GoPrevious();
  }

  validate()
  {
     this.broadcast.dispatch('validateBulkEdit');
  }


  buildTabs() {
    this.tabs= new Array<{ tabTitle: string; profile:any; multiFacetAwareItems : Array<{ multiFacetAwareItemDomainType: string; multiFacetAwareItemId: Uuid}>; editedProfiles : { body: { count: number; profilesProvided: [{ profile: Profile; profileProviderService: { namespace: string; name: string } }] } }}>();

    const multiFacetAwareItems = new Array<{ multiFacetAwareItemDomainType: string; multiFacetAwareItemId: Uuid }>();

    this.bulkEditPayload.selectedElements.forEach(element => {
      multiFacetAwareItems.push({ multiFacetAwareItemId: element.id, multiFacetAwareItemDomainType: element.domainType });
    });
    this.bulkEditPayload.selectedProfiles.forEach(profile => {
      const editedProfiles : any = null;
      this.tabs.push({ tabTitle: profile.displayName, profile,  multiFacetAwareItems, editedProfiles});
    });
  }

  save()
{

  const profiles : Array<any> = [];

  this.tabs.forEach((tab) =>
    {
        profiles.push(...tab.editedProfiles.body.profilesProvided);
    }
  );

  this.resouce.profile.saveMany(this.domainType, this.catalogueItemId, { profilesProvided: profiles }).pipe(
    catchError(error => {
      this.messageHandler.showError(error);
      return EMPTY;
    })
  ).subscribe(() => {
    this.dialog.openConfirmationAsync({
      data: {
        title: 'Close bulk editor?',
        okBtnTitle: 'Yes',
        cancelBtnTitle: 'No',
        btnType: 'primary',
        message: '<b>Save Successful</b>, do you want to close the bulk editor?',
      }
    }).subscribe(
      () => {
        this.cancel();
      }
    );

  });
}

}
