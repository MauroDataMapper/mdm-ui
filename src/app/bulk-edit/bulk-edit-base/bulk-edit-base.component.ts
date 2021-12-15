import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MultiFacetAwareDomainType, CatalogueItemDomainType, Uuid } from '@maurodatamapper/mdm-resources';
import { BulkEditPayload } from '../model/bulkEditPayload';

@Component({
  selector: 'mdm-bulk-edit-base',
  templateUrl: './bulk-edit-base.component.html',
  styleUrls: ['./bulk-edit-base.component.scss']
})
export class BulkEditBaseComponent implements OnInit {

  @Input() domainType: MultiFacetAwareDomainType | CatalogueItemDomainType;
  @Input() catalogueItemId: Uuid;
  @Input() bulkEditPayload: BulkEditPayload;
  @Output() bulkEditPayloadChanged = new EventEmitter<BulkEditPayload>();

  profileSelectStep = true;
  editorStep = false;

  constructor() { }

  ngOnInit(): void {
  }

  openEditor(){
    this.profileSelectStep = !this.profileSelectStep;
    this.editorStep = !this.editorStep;
  }

}
