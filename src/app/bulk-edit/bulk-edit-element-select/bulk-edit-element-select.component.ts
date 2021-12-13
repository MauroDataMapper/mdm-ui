import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MultiFacetAwareDomainType, CatalogueItemDomainType, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ColDef } from 'ag-grid-community';
import { BulkEditPayload } from '../model/bulkEditPayload';

@Component({
  selector: 'mdm-bulk-edit-element-select',
  templateUrl: './bulk-edit-element-select.component.html',
  styleUrls: ['./bulk-edit-element-select.component.scss']
})
export class BulkEditElementSelectComponent implements OnInit {

  @Input() domainType: MultiFacetAwareDomainType | CatalogueItemDomainType;
  @Input() catalogueItemId: Uuid;
  @Input() bulkEditPayload : BulkEditPayload;
  @Output() bulkEditPayloadChanged  = new EventEmitter<BulkEditPayload>();

  columnDefs: ColDef[] = [
    { field: 'make', sortable: true },
    { field: 'model', sortable: true },
    { field: 'price', sortable: true }
];

rowData = [
  { make: 'Toyota', model: 'Celica', price: 35000 },
  { make: 'Ford', model: 'Mondeo', price: 32000 },
  { make: 'Porsche', model: 'Boxter', price: 72000 }
];

  constructor(private resources : MdmResourcesService) { }

  ngOnInit(): void {
    //this.resources.da
  }

}
