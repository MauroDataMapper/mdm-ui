import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueItemDomainType, MultiFacetAwareDomainType, Profile, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
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

  constructor(private resouces: MdmResourcesService, private messageHandler: MessageHandlerService) { }

  ngOnInit(): void {
    this.resouces.profile.getMany(this.domainType, this.catalogueItemId, {itemsProfiles:[{ multiFacetAwareItemDomainType:'DataModel', multiFacetAwareItemId: '59923a64-c5ae-4b94-a825-2ca5c7e803f3'}]}).pipe(
      catchError((error) => { this.messageHandler.showError(error); return EMPTY; })
    ).subscribe((result) => {
      this.profiles = result.body;
    }
    );
  }

}
