import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { Subscription } from 'rxjs';
import { ResourcesService } from '../../services/resources.service';
import { MessageHandlerService } from '../../services/utility/message-handler.service';

@Component({
  selector: 'app-share-with',
  templateUrl: './share-with.component.html',
  styleUrls: ['./share-with.component.sass']
})
export class ShareWithComponent implements OnInit {
  folderResult: any;
  subscription: Subscription;
  // @Input() folderResult: FolderResult;

  constructor(
    private messageService: MessageService,
    private resourcesService: ResourcesService,
    private messageHandler: MessageHandlerService
  ) {}

  supportedDomainTypes = {
    DataModel: { name: 'dataModel', message: 'Data Model' },
    Classifier: { name: 'classifier', message: 'Classifier' },
    Folder: { name: 'folder', message: 'Folder' },
    Terminology: { name: 'terminology', message: 'Terminology' },
    CodeSet: {name: 'codeSet', message: 'CodeSet' }
  };
  readableByEveryone: false;
  readableByAuthenticated: false;
  @Input() mcElement: '=';
  @Input() mcDomainType: '=';
  endPoint;
  type;
  message = '';

  ngOnInit() {
    this.folderResult = this.messageService.getFolderPermissions();
    this.readableByEveryone = this.folderResult['readableByEveryone'];
    this.readableByAuthenticated = this.folderResult['readableByAuthenticated'];
    this.type = this.supportedDomainTypes[this.mcDomainType];
    this.endPoint = this.resourcesService[this.type.name];
    this.message = this.type.message;
  }


  // FolderDetails2(): any {//call this when getting from resourse service -NG
  //     this.subscription = this.resourcesService.Folderdetails.subscribe(serverResult => {
  //     this.result = serverResult;
  //     console.log(this.result);
  //   });
  //   //console.log(this.resourcesService.NGgetFolderDetails());
  // }

  shareReadWithEveryoneChanged() {
    const promise = new Promise((resolve, reject) => {
      if (this.readableByEveryone) {
        this.endPoint
          .put(this.folderResult.id, 'readByEveryone', null)
          .subscribe(result => {
            this.folderResult = result.body;
            this.endPoint
              .get(this.folderResult.id, 'permissions', null)
              .subscribe(permissions => {
                for (const attrname in permissions.body) {
                  this.folderResult[attrname] = permissions.body[attrname];
                }
              });
            this.messageService.dataChanged(this.folderResult);
            resolve();
          });
      } else if (!this.readableByEveryone) {
        this.endPoint
          .delete(this.folderResult.id, 'readByEveryone', null, null)
          .subscribe(result => {
            this.folderResult = result.body;
            this.endPoint
              .get(this.folderResult.id, 'permissions', null)
              .subscribe(permissions => {
                for (const attrname in permissions.body) {
                  this.folderResult[attrname] = permissions.body[attrname];
                }
              });
            this.messageService.dataChanged(this.folderResult);
            resolve();
          });
      } else {
        reject();
      }
    });

    promise
      .then(() => {
        this.messageHandler.showSuccess(
          this.message + ' updated successfully.'
        );
      })
      .catch(function(error) {
        this.messageHandler.showError(
          'There was a problem updating the ' + this.message + '.',
          error
        );
      });
  }

  shareReadWithAuthenticatedChanged() {
    const promise = new Promise((resolve, reject) => {
      if (this.readableByAuthenticated) {
        this.endPoint
          .put(this.folderResult.id, 'readByAuthenticated', null)
          .subscribe(serverResult => {
            this.folderResult = serverResult.body;
            this.endPoint
              .get(this.folderResult.id, 'permissions', null)
              .subscribe(permissions => {
                for (const attrname in permissions.body) {
                  this.folderResult[attrname] = permissions.body[attrname];
                }
              });
            this.messageService.dataChanged(this.folderResult);
            resolve();
          });
      } else if (!this.readableByAuthenticated) {
        this.endPoint
          .delete(this.folderResult.id, 'readByAuthenticated')
          .subscribe(serverResult => {
            this.folderResult = serverResult.body;
            this.endPoint
              .get(this.folderResult.id, 'permissions', null)
              .subscribe(permissions => {
                for (const attrname in permissions.body) {
                  this.folderResult[attrname] = permissions.body[attrname];
                }
              });
            this.messageService.dataChanged(this.folderResult);
            resolve();
          });
      } else {
        reject();
      }
    });

    promise
      .then(() => {
        this.messageHandler.showSuccess(
          this.message + ' updated successfully.'
        );
      })
      .catch(function(error) {
        this.messageHandler.showError(
          'There was a problem updating the ' + this.message + '.',
          error
        );
      });
  }

}
