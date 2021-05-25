/*
Copyright 2020-2021 University of Oxford
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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { VersionedFolderDetail, VersionedFolderDetailResponse } from '@maurodatamapper/mdm-resources';
import { SecurityModalComponent } from '@mdm/modals/security-modal/security-modal.component';
import { FormState, ItemDetailForm } from '@mdm/model/editable-forms';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService, MessageHandlerService, MessageService, SharedService, StateHandlerService } from '@mdm/services';
import { EditingService } from '@mdm/services/editing.service';
import { ContainerAccess } from '@mdm/services/handlers/security-handler.model';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mdm-versioned-folder-detail',
  templateUrl: './versioned-folder-detail.component.html',
  styleUrls: ['./versioned-folder-detail.component.scss']
})
export class VersionedFolderDetailComponent implements OnInit, OnDestroy {

  @Input() detail: VersionedFolderDetail;
  @Input() access: ContainerAccess;

  editor: FormState<VersionedFolderDetail, ItemDetailForm<VersionedFolderDetail>>;

  isAdminUser = false;
  processing = false;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private resourcesService: MdmResourcesService,
    private messages: MessageService,
    private messageHandler: MessageHandlerService,
    private stateHandler: StateHandlerService,
    private shared: SharedService,
    private broadcast: BroadcastService,
    private dialog: MatDialog,
    private title: Title,
    private editing: EditingService) { }

  ngOnInit(): void {
    this.isAdminUser = this.shared.isAdmin;

    this.title.setTitle(`Versioned Folder - ${this.detail?.label}`);

    this.editor = new FormState(
      this.detail,
      new ItemDetailForm<VersionedFolderDetail>());

    this.editor.onShow
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.editing.start());

    this.editor.onCancel
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.editing.stop());

    this.editor.onFinish
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.editing.stop());
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleShowSearch() {
    this.messages.toggleSearch();
  }

  showSecurityDialog() {
    this.dialog.open(SecurityModalComponent, {
      data: {
        element: 'versionedFolder',
        domainType: 'VersionedFolder'
      },
      panelClass: 'security-modal'
    });
  }

  showForm() {
    this.editor.show();
  }

  cancel() {
    this.editor?.cancel();
  }

  save() {
    if (!this.editor.form.valid) {
      return;
    }

    this.editor.form.disable();

    this.resourcesService.versionedFolder
      .update(
        this.detail.id,
        {
          id: this.detail.id,
          label: this.editor.form.label?.value
        })
      .pipe(
        catchError(error => {
          this.messageHandler.showError('There was a problem updating the Versioned Folder.', error);
          return EMPTY;
        }),
        finalize(() => this.editor.form.enable())
      )
      .subscribe(
        (response: VersionedFolderDetailResponse) => {
          this.messageHandler.showSuccess('Versioned Folder updated successfully.');
          this.editor.finish(response.body);
          this.broadcast.broadcast('$reloadFoldersTree');
        });
  }

  askForSoftDelete() {
    if (!this.access.showSoftDelete) {
      return;
    }

    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Are you sure you want to delete this Versioned Folder?',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `<p class="marginless">This Versioned Folder will be marked as deleted and will not be viewable by users </p>
                    <p class="marginless">except Administrators.</p>`
        }
      })
      .subscribe(() => this.delete(false));
  }

  askForPermanentDelete(): any {
    if (!this.access.showPermanentDelete) {
      return;
    }

    this.dialog
      .openDoubleConfirmationAsync(
        {
          data: {
            title: 'Permanent deletion',
            okBtnTitle: 'Yes, delete',
            btnType: 'warn',
            message:
              'Are you sure you want to <span class=\'warning\'>permanently</span> delete this Versioned Folder?'
          }
        },
        {
          data: {
            title: 'Confirm permanent deletion',
            okBtnTitle: 'Confirm deletion',
            btnType: 'warn',
            message: `<p class='marginless'><strong>Note: </strong>All its contents
                    <p class='marginless'>will be deleted <span class='warning'>permanently</span>.</p>`
          }
        }
      )
      .subscribe(() => this.delete(true));
  }

  private delete(permanent: boolean) {
    if (!this.access.showSoftDelete && !this.access.showPermanentDelete) {
      return;
    }

    this.processing = true;

    this.resourcesService.versionedFolder
      .remove(this.detail.id, { permanent })
      .pipe(
        catchError(error => {
          this.messageHandler.showError(
            'There was a problem deleting the Versioned Folder.',
            error
          );
          return EMPTY;
        }),
        finalize(() => {
          this.processing = false;
        })
      )
      .subscribe(
        () => {
          this.broadcast.broadcast('$reloadFoldersTree');
          if (permanent) {
            this.stateHandler.Go(
              'appContainer.mainApp.twoSidePanel.catalogue.allDataModel'
            );
          } else {
            this.stateHandler.reload();
          }
        });
  }
}
