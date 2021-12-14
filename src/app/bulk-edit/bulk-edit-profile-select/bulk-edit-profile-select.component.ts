import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueItemDomainType, MultiFacetAwareDomainType, Profile, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditPayload } from '../model/bulkEditPayload';

@Component({
  selector: 'mdm-bulk-edit-profile-select',
  templateUrl: './bulk-edit-profile-select.component.html',
  styleUrls: ['./bulk-edit-profile-select.component.scss']
})
export class BulkEditProfileSelectComponent implements OnInit {

  @Input() domainType: MultiFacetAwareDomainType | CatalogueItemDomainType;
  @Input() catalogueItemId: Uuid;
  @Input() bulkEditPayload: BulkEditPayload;
  @Output() bulkEditPayloadChanged = new EventEmitter<BulkEditPayload>();

  profiles: Array<Profile>;

  constructor(private resouces: MdmResourcesService, private messageHandler: MessageHandlerService, private stateHandler: StateHandlerService) { }

  ngOnInit(): void {

    this.resouces.dataModel.dataElements(this.catalogueItemId).pipe(
      catchError((error) => { this.messageHandler.showError(error); return EMPTY;})
    ).switchMap((profiles) => {

      const itemsProfiles = new Array<any>();

      profiles.array.forEach(dataElement => {
        itemsProfiles.push({ multiFacetAwareItemDomainType: dataElement.domainType, multiFacetAwareItemId: dataElement.id });
      });

      this.resouces.profile.getMany(this.domainType, this.catalogueItemId, {itemsProfiles}).
      pipe(
        catchError(profileError => {
           this.messageHandler.showError(profileError);
           return EMPTY;
        })
      ).subscribe(result => {
        this.profiles = result.body;
      });
    });
  }

  proceedToEdit()
  {

  }


  cancel()
  {
    this.stateHandler.GoPrevious();
  }
}
