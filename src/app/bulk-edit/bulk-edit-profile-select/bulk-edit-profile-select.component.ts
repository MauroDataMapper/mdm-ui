import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueItemDomainType, DataElementDetail, MultiFacetAwareDomainType, ProfileSummary, ProfileSummaryIndexResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditPayload } from '../model/bulkEditPayload';

@Component({
  selector: 'mdm-bulk-edit-profile-select',
  templateUrl: './bulk-edit-profile-select.component.html',
  styleUrls: ['./bulk-edit-profile-select.component.scss']
})
export class BulkEditProfileSelectComponent implements OnInit {

  @Output() nextSelected = new EventEmitter<any>();
  @Input() bulkEditPayload: BulkEditPayload;


  catalogueItemId: Uuid;
  domainType: MultiFacetAwareDomainType | CatalogueItemDomainType;
  profiles: Array<ProfileSummary>;
  selectedProfiles = new Array<ProfileSummary>();

  constructor(private resouces: MdmResourcesService, private messageHandler: MessageHandlerService, private stateHandler: StateHandlerService, private uiRouterGlobals: UIRouterGlobals) { }

  ngOnInit(): void {

    this.catalogueItemId = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;

    this.resouces.dataModel.dataElements(this.catalogueItemId).pipe(
      catchError((error) => { this.messageHandler.showError(error); return EMPTY; })
    ).subscribe((profiles) => {

      const de: DataElementDetail = profiles.body.items[0];

      forkJoin(
        {
          used: this.resouces.profile.usedProfiles(de.domainType, de.id),
          unused: this.resouces.profile.unusedProfiles(de.domainType, de.id)
        }
      ).pipe(
        catchError(error => {
          this.messageHandler.showError(error);
          return EMPTY;
        })
      ).subscribe((res) => {
        const usedRes = res.used as ProfileSummaryIndexResponse;
        const unusedRes = res.unused as ProfileSummaryIndexResponse;
        this.profiles = usedRes.body;
        this.profiles.push(...unusedRes.body);
      }
      );
    });
  }

  proceedToEdit() {
    this.nextSelected.emit(this.selectedProfiles);
  }


  cancel() {
    this.stateHandler.GoPrevious();
  }
}
