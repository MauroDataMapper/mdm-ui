import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MultiFacetAwareDomainType, CatalogueItemDomainType, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { ColDef } from 'ag-grid-community';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditPayload } from '../model/bulkEditPayload';

@Component({
  selector: 'mdm-bulk-edit-element-select',
  templateUrl: './bulk-edit-element-select.component.html',
  styleUrls: ['./bulk-edit-element-select.component.scss']
})
export class BulkEditElementSelectComponent implements OnInit {

  @Output() nextSelected = new EventEmitter<any>();

  @Input() bulkEditPayload: BulkEditPayload;
  @Output() bulkEditPayloadChanged = new EventEmitter<BulkEditPayload>();

  catalogueItemId: Uuid;
  domainType: CatalogueItemDomainType | MultiFacetAwareDomainType;
  elements: any;

  constructor(private stateHandler: StateHandlerService, private resources: MdmResourcesService, private uiRouterGlobals: UIRouterGlobals, private messageHandler: MessageHandlerService) { }

  ngOnInit(): void {
    this.catalogueItemId = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;
    this.load();
  }

  load() {
    this.resources.dataModel.dataElements(this.catalogueItemId).pipe(
      catchError(error => {
        this.messageHandler.showError(console.error);
        return EMPTY;
      })
    ).subscribe(elements => {
      this.elements = elements.body.items;
    })
  }

  proceedToProfile() {
    this.nextSelected.emit();
  }

  
  objectComparisonFunction = function( option, value ) : boolean {
    return option.id === value.id;
  }
  

  cancel() {
    this.stateHandler.GoPrevious();
  }


}
