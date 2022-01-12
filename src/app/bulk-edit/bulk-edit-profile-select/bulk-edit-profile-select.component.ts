import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueItemDomainType, DataElementDetail, MultiFacetAwareDomainType, ProfileSummary, ProfileSummaryIndexResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditContext } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-profile-select',
  templateUrl: './bulk-edit-profile-select.component.html',
  styleUrls: ['./bulk-edit-profile-select.component.scss']
})
export class BulkEditProfileSelectComponent implements OnInit {

  @Output() nextSelected = new EventEmitter<any>();
  @Output() backSelected = new EventEmitter<any>();

  @Input() bulkEditPayload: BulkEditContext;
  @Output() bulkEditPayloadChanged = new EventEmitter<BulkEditContext>();

  catalogueItemId: Uuid;
  domainType: MultiFacetAwareDomainType | CatalogueItemDomainType;
  profiles: Array<ProfileSummary>;

  constructor(private resouces: MdmResourcesService, private messageHandler: MessageHandlerService, private stateHandler: StateHandlerService, private uiRouterGlobals: UIRouterGlobals) { }

  ngOnInit(): void {

    this.catalogueItemId = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;

    // Profiles are the same for all elements so taking the element and getting the used/unsed to get full list of selectable profiles
    const de: DataElementDetail = this.bulkEditPayload.elements[0];

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
    });
  }

  proceedToEdit() {
    this.nextSelected.emit();
  }

  openElements() {
    this.backSelected.emit();
  }

  objectComparisonFunction( option, value ) : boolean {
    return option.name === value.name && option.namespace === value.namespace;
  };


  cancel() {
    this.stateHandler.GoPrevious();
  }
}
