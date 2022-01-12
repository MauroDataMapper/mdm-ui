import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueItemDomainType, DataElementDetail, MultiFacetAwareDomainType, ProfileSummary, ProfileSummaryIndexResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditContext } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-profile-select',
  templateUrl: './bulk-edit-profile-select.component.html',
  styleUrls: ['./bulk-edit-profile-select.component.scss']
})
export class BulkEditProfileSelectComponent implements OnInit {
  @Output() nextSelected = new EventEmitter<void>();
  @Output() backSelected = new EventEmitter<void>();

  /** Two-way binding */
  @Input() context: BulkEditContext;
  @Output() contextChanged = new EventEmitter<BulkEditContext>();

  profiles: ProfileSummary[];

  constructor(
    private resouces: MdmResourcesService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService) { }

  ngOnInit(): void {
    forkJoin([
      this.resouces.profile.usedProfiles(this.context.domainType, this.context.catalogueItemId),
      this.resouces.profile.unusedProfiles(this.context.domainType, this.context.catalogueItemId)
    ])
    .pipe(
      catchError(error => {
        this.messageHandler.showError(error);
        return EMPTY;
      })
    )
    .subscribe(([used, unused]: [ProfileSummaryIndexResponse, ProfileSummaryIndexResponse]) => {
      this.profiles = [
        ...used.body,
        ...unused.body
      ];
    });
  }

  proceedToEdit() {
    this.nextSelected.emit();
  }

  openElements() {
    this.backSelected.emit();
  }

  objectComparisonFunction(option, value) : boolean {
    return option.name === value.name && option.namespace === value.namespace;
  };

  cancel() {
    this.stateHandler.GoPrevious();
  }
}
