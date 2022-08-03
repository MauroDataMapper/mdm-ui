/*
Copyright 2020-2022 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  Branchable,
  DomainExport,
  DomainExportResponse,
  MdmResponse,
  Modelable,
  Uuid,
  Versionable
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import {
  ExportHandlerService,
  MessageHandlerService,
  StateHandlerService
} from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/angular';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

type DomainExportModelItem = Modelable & Branchable & Versionable;

@Component({
  selector: 'mdm-domain-exports-detail',
  templateUrl: './domain-exports-detail.component.html',
  styleUrls: ['./domain-exports-detail.component.scss']
})
export class DomainExportsDetailComponent implements OnInit {
  export: DomainExport;
  models: DomainExportModelItem[];

  displayedColumns = ['model', 'view'];

  constructor(
    private resources: MdmResourcesService,
    private title: Title,
    private routerGlobals: UIRouterGlobals,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private exportHandler: ExportHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Exported model');
    const id: Uuid = this.routerGlobals.params.id;

    this.resources.domainExports
      .get(id)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem fetching the exported model details.',
            error
          );
          return EMPTY;
        }),
        switchMap((response: DomainExportResponse) => {
          this.export = response.body;

          const resource = this.resources.getCommonResource(
            this.export.exported.domainType
          );

          let requests$: Observable<MdmResponse<DomainExportModelItem>>[];
          if (this.export.exported.domainIds) {
            requests$ = this.export.exported.domainIds.map((modelId) => {
              return resource.get(modelId);
            });
          } else {
            requests$ = [resource.get(this.export.exported.domainId)];
          }

          return forkJoin(requests$);
        })
      )
      .subscribe((responses: MdmResponse<DomainExportModelItem>[]) => {
        this.models = responses.map((response) => response.body);
      });
  }

  close() {
    this.stateHandler.Go('appContainer.userArea.domainExports');
  }

  viewModel(model: DomainExportModelItem) {
    this.stateHandler.Go(model.domainType, { id: model.id });
  }

  downloadExport() {
    this.exportHandler.downloadDomainExport(this.export);
  }

  deleteExport() {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Delete exported model',
          message:
            'Are you sure you want to delete this exported model? This cannot be undone once deleted.',
          okBtnTitle: 'Yes',
          cancelBtnTitle: 'No'
        }
      })
      .pipe(
        switchMap(() => this.resources.domainExports.remove(this.export.id)),
        catchError((error) => {
          this.messageHandler.showError(
            'There was a problem deleting this exported model.',
            error
          );
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.close();
      });
  }
}
