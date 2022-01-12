import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MultiFacetAwareDomainType, CatalogueItemDomainType, Uuid, DataElementIndexResponse, DataElement } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditContext } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-element-select',
  templateUrl: './bulk-edit-element-select.component.html',
  styleUrls: ['./bulk-edit-element-select.component.scss']
})
export class BulkEditElementSelectComponent implements OnInit {
  @Output() nextSelected = new EventEmitter<void>();

  /** Two way binding */
  @Input() context: BulkEditContext;
  @Output() contextChanged = new EventEmitter<BulkEditContext>();

  elements: DataElement[];

  constructor(
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService,
    private messageHandler: MessageHandlerService) { }

  ngOnInit(): void {
    this.resources.dataModel
      .dataElements(this.context.catalogueItemId)
      .pipe(
        catchError(error => {
          this.messageHandler.showError(error);
          return EMPTY;
        })
      )
      .subscribe((response: DataElementIndexResponse) => {
        this.elements = response.body.items;
      });
  }

  proceedToProfile() {
    this.nextSelected.emit();
  }

  objectComparisonFunction(option, value): boolean {
    return option.id === value.id;
  };

  cancel() {
    this.stateHandler.GoPrevious();
  }
}
