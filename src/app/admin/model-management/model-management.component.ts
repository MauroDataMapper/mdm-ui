import { Component, OnInit } from '@angular/core';
import { ResourcesService } from '@mdm/services/resources.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-model-management',
  templateUrl: './model-management.component.html',
  styleUrls: ['./model-management.component.sass']
})
export class ModelManagementComponent implements OnInit {
  filterElement: string;
  filterStatus: string;
  selectedElements: any[];
  selectedElementsCount = 0;
  reloading = false;
  deleteInProgress = false;
  deleteSuccessMessage: string;
  folders: any;

  constructor(
    private resourcesService: ResourcesService,
    private securityHandler: SecurityHandlerService,
    private messageHandler: MessageHandlerService,
    private dialog: MatDialog,
    private title: Title
  ) {}

  ngOnInit() {
    this.selectedElements = [];
    this.selectedElementsCount = 0;
    this.filterStatus = '';
    this.filterElement = '';
    this.loadFolders();
    this.title.setTitle('Model management');
  }

  onFilterChange = function() {
    if (this.filterElement === '') {
      this.filterStatus = '';
    }

    this.loadFolders();
  };

  loadFolders = () => {
    this.reloading = true;

    let options = {
      queryStringParams: {
        includeDocumentSuperseded: true,
        includeModelSuperseded: true,
        includeDeleted: true
      }
    };

    let method = this.resourcesService.tree.get(null, null, options);
    if (this.filterStatus === null) {
      // no op
    } else if (this.filterStatus === 'deleted') {
      //   if (this.filterElement === "dataModel") {
      //     method = this.resourcesService.admin.get("dataModels/deleted");
      //   } else if (this.filterElement === "terminology") {
      //     method = this.resourcesService.admin.get("terminologies/deleted");
      //   }
      options = {
        queryStringParams: {
          includeDocumentSuperseded: false,
          includeModelSuperseded: false,
          includeDeleted: true
        }
      };
      method = this.resourcesService.tree.get(null, null, options);
    } else if (this.filterStatus === 'documentSuperseded') {
      //   if (this.filterElement === "dataModel") {
      //     method = this.resourcesService.admin.get(
      //       "dataModels/documentSuperseded"
      //     );
      //   } else if (this.filterElement === "terminology") {
      //     method = this.resourcesService.admin.get(
      //       "terminologies/documentSuperseded"
      //     );
      //   }
      options = {
        queryStringParams: {
          includeDocumentSuperseded: true,
          includeModelSuperseded: false,
          includeDeleted: false
        }
      };
      method = this.resourcesService.tree.get(null, null, options);
    } else if (this.filterStatus === 'modelSuperseded') {
      //   if (this.filterElement === "dataModel") {
      //     method = this.resourcesService.admin.get("dataModels/modelSuperseded");
      //   } else if (this.filterElement === "terminology") {
      //     method = this.resourcesService.admin.get(
      //       "terminologies/modelSuperseded"
      //     );
      //   }
      options = {
        queryStringParams: {
          includeDocumentSuperseded: false,
          includeModelSuperseded: true,
          includeDeleted: false
        }
      };
      method = this.resourcesService.tree.get(null, null, options);
    }

    method.subscribe(resp => {
      this.folders = {
        children: resp.body,
        isRoot: true
      };

      for (const entry of this.folders.children) {
        entry.checked = false;
        this.markChildren(entry);
      }

      this.reloading = false;
    },
      err => {
        this.reloading = false;
        this.messageHandler.showError('There was a problem loading tree.', err);
      });
  };

  markChildren = function(node) {
    if (this.selectedElements) {
      if (this.selectedElements[node.id]) {
        node.checked = true;
      }
    }

    if (node.children) {
      for (const entry of node.children) {
        this.markChildren(entry);
      }
    }
  };

  onNodeChecked = function(node) {
    const currentIdx = this.selectedElements.findIndex(x => x.id === [node.id]);
    if (currentIdx === -1) {
      this.selectedElements.push(node);
      this.selectedElementsCount++;
    } else {
      this.selectedElements.splice(currentIdx, 1);
      this.selectedElementsCount--;
    }
  };

  resetSettings = function() {
    this.loadFolders();
    this.selectedElements = {};
    this.selectedElementsCount = 0;
    this.deleteSuccessMessage = null;
  };

  delete(permanent?) {
    const dataModelResources = {
      permanent,
      ids: []
    };

    for (const id in this.selectedElements) {
      if (this.selectedElements[id].domainType === 'DataModel') {
        dataModelResources.ids.push(this.selectedElements[id].id);
      }
    }

    this.deleteInProgress = true;
    this.resourcesService.dataModel.delete(null, null, null, dataModelResources).subscribe(() => {
          if (permanent) {
            this.deleteSuccessMessage = this.selectedElementsCount + ' Data Model(s) deleted successfully.';
            this.deleteInProgress = false;

            setTimeout(() => {
              this.resetSettings();
            }, 2000);
          } else {
            this.deleteSuccessMessage = this.selectedElementsCount + ' Data Model(s) marked as deleted successfully.';
            this.deleteInProgress = false;

            setTimeout(() => {
              this.resetSettings();
            }, 2000);
          }
        }, error => {
          this.deleteInProgress = false;
          this.messageHandler.showError('There was a problem deleting the Data Model(s).', error);
        }
      );
  }

  askForSoftDelete() {
    const promise = new Promise((resolve, reject) => {
      if (!this.securityHandler.isAdmin()) {
        reject({ message: 'You should be an Admin!' });
      }

      let message = 'Are you sure you want to delete these Elements?<br>They will be marked as deleted and will not be viewable by users except Administrators.';
      if (this.selectedElementsCount === 1) {
        message = 'Are you sure you want to delete this Element?<br>It will be marked as deleted and will not be viewable by users except Administrators.';
      }

      const dialog = this.dialog.open(ConfirmationModalComponent, {
        hasBackdrop: true,
        autoFocus: false,
        data: {
          title: 'Folder delete',
          okBtnTitle: 'Confirm folder deletion',
          btnType: 'warn',
          message
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result?.status !== 'ok') {
          return promise;
        }

        this.delete(false);
      });
    });
    return promise;
  }

  askForPermanentDelete() {
    const promise = new Promise((resolve, reject) => {
      if (!this.securityHandler.isAdmin()) {
        reject({ message: 'You should be an Admin!' });
      }

      let message = 'Are you sure you want to <span class=\'errorMessage\'>permanently</span> delete these Elements?';
      if (this.selectedElementsCount === 1) {
        message = 'Are you sure you want to <span class=\'errorMessage\'>permanently</span> delete this Element?';
      }

      const dialog = this.dialog.open(ConfirmationModalComponent, {
        hasBackdrop: true,
        autoFocus: false,
        data: {
          title: 'Data Model deletion',
          okBtnTitle: 'Delete permanently',
          btnType: 'warn',
          message,
        }
      });

      dialog.afterClosed().subscribe(result => {
        if (result.status !== 'ok') {
          return;
        }

        message = '<strong>Are you sure?</strong><br>All their child elements such as \'Data Classes\', \'Data Elements\', <br> \'Data Types\' and \'Terms(for terminology)\' will be deleted <span class=\'warning\'>permanently</span>.';
        if (this.selectedElementsCount === 1) {
          message = '<strong>Are you sure?</strong><br>All its child elements such as \'Data Classes\', \'Data Elements\', <br> \'Data Types\' and \'Terms(for terminology)\' will be deleted <span class=\'warning\'>permanently</span>.';
        }

        const dialog2 = this.dialog.open(ConfirmationModalComponent, {
          hasBackdrop: true,
          autoFocus: false,
          data: {
            title: 'Permanent delete',
            okBtnTitle: 'Confirm permanent deletion',
            btnType: 'warn',
            message
          }
        });

        dialog2.afterClosed().subscribe(res => {
          if (res?.status !== 'ok') {
            reject(null);
            return;
          }

          this.delete(true);
        });
      });
    });

    return promise;
  }
}
