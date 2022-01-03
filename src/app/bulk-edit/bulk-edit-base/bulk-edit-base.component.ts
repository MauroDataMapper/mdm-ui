import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  @Input() domainType: MultiFacetAwareDomainType | CatalogueItemDomainType;
  @Input() catalogueItemId: Uuid;
  @Output() bulkEditPayloadChanged = new EventEmitter<BulkEditPayload>();

  bulkEditPayload: BulkEditPayload;

  profileSelectStep = true;
  editorStep = false;
  tabs : Array<{ tabTitle: string; profile:any; multiFacetAwareItems : Array<{ multiFacetAwareItemDomainType: string; multiFacetAwareItemId: Uuid }>}>;
  editedProfiles: { body: { count: number; profilesProvided: [{ profile: Profile; profileProviderService: { namespace: string; name: string } }] } };


  constructor(private dialog: MatDialog, private stateHandler: StateHandlerService, private resouce: MdmResourcesService, private broadcast: BroadcastService,  private uiRouterGlobals: UIRouterGlobals, private messageHandler: MessageHandlerService) { }

  ngOnInit(): void {
    this.bulkEditPayload = { selectedElements: [], selectedProfiles: [] };
  }

  openEditor() {
    this.profileSelectStep = !this.profileSelectStep;
    this.editorStep = !this.editorStep;
    if (this.editorStep) {

      // build tabs
      this.buildTabs();
    }
  }


  cancel() {
    this.stateHandler.GoPrevious();
  }

  validate()
  {
     this.broadcast.dispatch('validateBulkEdit');
  }


  buildTabs() {
    this.tabs= new Array<{ tabTitle: string; profile:any; multiFacetAwareItems : Array<{ multiFacetAwareItemDomainType: string; multiFacetAwareItemId: Uuid }>}>();

    const multiFacetAwareItems = new Array<{ multiFacetAwareItemDomainType: string; multiFacetAwareItemId: Uuid }>();

    this.bulkEditPayload.selectedElements.forEach(element => {
      multiFacetAwareItems.push({ multiFacetAwareItemId: element.id, multiFacetAwareItemDomainType: element.domainType });
    });
    this.bulkEditPayload.selectedProfiles.forEach(profile => {
      this.tabs.push({ tabTitle: profile.displayName, profile,  multiFacetAwareItems});
    });
  }

  save()
{
  this.resouce.profile.saveMany(this.domainType, this.catalogueItemId, { profilesProvided: this.editedProfiles.body.profilesProvided }).pipe(
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
