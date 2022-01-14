import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { DataModelDetail, DataModelDetailResponse } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { StateHandlerService, MessageHandlerService, BroadcastService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { BulkEditContext, BulkEditStep } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-container',
  templateUrl: './bulk-edit-container.component.html',
  styleUrls: ['./bulk-edit-container.component.scss']
})
export class BulkEditContainerComponent implements OnInit {
  context: BulkEditContext;
  parent: DataModelDetail;
  currentStep: BulkEditStep = BulkEditStep.Selection;

  public Steps = BulkEditStep;

  constructor(
    private dialog: MatDialog,
    private stateHandler: StateHandlerService,
    private resouce: MdmResourcesService,
    private broadcast: BroadcastService,
    private uiRouterGlobals: UIRouterGlobals,
    private messageHandler: MessageHandlerService,
    private title: Title) { }

  ngOnInit(): void {
    this.context = {
      catalogueItemId: this.uiRouterGlobals.params.id,
      domainType: this.uiRouterGlobals.params.domainType,
      elements: [],
      profiles: []
    };

    this.resouce.dataModel
      .get(this.context.catalogueItemId)
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem getting the parent catalogue item.', error);
          return EMPTY;
        })
      )
      .subscribe((response: DataModelDetailResponse) => {
        this.parent = response.body;
        this.title.setTitle(`Bulk Edit - ${this.parent.label}`);
      });
  }

  cancel() {
    this.stateHandler.GoPrevious();
  }

  next() {
    this.currentStep = this.currentStep + 1;
  }

  previous() {
    this.currentStep = this.currentStep - 1;
  }

  validate() {
    this.broadcast.dispatch('validateBulkEdit');
  }

  save(profiles: any[]) {
    this.resouce.profile
      .saveMany(
        this.context.domainType,
        this.context.catalogueItemId,
        { profilesProvided: profiles })
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem saving the profiles.', error);
          return EMPTY;
        }),
        switchMap(() => {
          return this.dialog.openConfirmationAsync({
            data: {
              title: 'Close bulk editor?',
              okBtnTitle: 'Yes',
              cancelBtnTitle: 'No',
              btnType: 'primary',
              message: '<b>Save Successful</b>, do you want to close the bulk editor?',
            }
          });
        })
      )
      .subscribe(() => {
        // Chosen to close the editor and go back
        this.cancel();
      });
  }
}
