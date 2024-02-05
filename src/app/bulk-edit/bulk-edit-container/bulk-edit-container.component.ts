/*
Copyright 2020-2024 University of Oxford and NHS England

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MauroItemProviderService } from '@mdm/mauro/mauro-item-provider.service';
import { MauroItem } from '@mdm/mauro/mauro-item.types';
import { StateHandlerService, MessageHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY, of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { BulkEditContext, BulkEditStep } from '../bulk-edit.types';

@Component({
  selector: 'mdm-bulk-edit-container',
  templateUrl: './bulk-edit-container.component.html',
  styleUrls: ['./bulk-edit-container.component.scss']
})
export class BulkEditContainerComponent implements OnInit {
  context: BulkEditContext;
  parent: MauroItem;
  currentStep: BulkEditStep = BulkEditStep.Selection;
  hasChanged = false;

  public Steps = BulkEditStep;

  constructor(
    private stateHandler: StateHandlerService,
    private itemProvider: MauroItemProviderService,
    private uiRouterGlobals: UIRouterGlobals,
    private messageHandler: MessageHandlerService,
    private title: Title,
    private editing: EditingService
  ) {}

  ngOnInit(): void {
    this.context = {
      rootItem: {
        id: this.uiRouterGlobals.params.id,
        domainType: this.uiRouterGlobals.params.domainType,
        model: this.uiRouterGlobals.params.dataModelId,
        parentDataClass: this.uiRouterGlobals.params.dataClassId
      },
      childItems: [],
      profiles: []
    };

    this.itemProvider
      .get(this.context.rootItem)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem getting the parent catalogue item.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe((item: MauroItem) => {
        this.parent = item;
        this.title.setTitle(`Bulk Edit - ${this.parent.label}`);
        this.editing.start();
      });
  }

  cancel() {
    const confirm$ =
      this.currentStep === BulkEditStep.Editor && this.hasChanged
        ? this.editing.confirmCancelAsync()
        : of(true);

    confirm$.pipe(filter((confirm) => !!confirm)).subscribe(() => {
      this.editing.stop();
      this.stateHandler.GoPrevious();
    });
  }

  next() {
    this.currentStep = this.currentStep + 1;
    this.hasChanged = false;
  }

  previous() {
    const confirm$ = this.hasChanged
      ? this.editing.confirmCancelAsync()
      : of(true);

    confirm$.pipe(filter((confirm) => !!confirm)).subscribe(() => {
      this.currentStep = this.currentStep - 1;
      this.hasChanged = false;
    });
  }

  onChanged() {
    this.hasChanged = true;
  }

  onSaved() {
    this.hasChanged = false;
  }
}
