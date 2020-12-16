/*
Copyright 2020 University of Oxford

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

export class BaseDataGrid {
   displayedColumns: string[];
   records: Array<any>;
   totalItemCount: any;
}

export class RuleRepresentation {
   id:any;
   rule: RuleModel;
   language: any;
   representation: any;
}

export class RuleModel {
   rule: Array<RuleRepresentation>;
   name: any;
   description: any;
   id:any;

   constructor(rule: Array<RuleRepresentation>, name: any, description: any) {
      this.rule = rule;
      this.name = name;
      this.description = description;
   }
}

import {
   trigger,
   state,
   style,
   transition,
   animate
} from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddRuleModalComponent } from '@mdm/modals/add-rule-modal/add-rule-modal.component';
import { AddRuleRepresentationModalComponent } from '@mdm/modals/add-rule-representation-modal/add-rule-representation-modal.component';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';

@Component({
   selector: 'mdm-constraints-rules',
   templateUrl: './constraints-rules.component.html',
   styleUrls: ['./constraints-rules.component.scss'],
   animations: [
      trigger('detailExpand', [
         state(
            'collapsed',
            style({ height: '0px', minHeight: '0', display: 'none' })
         ),
         state('expanded', style({ height: '*' })),
         transition(
            'expanded <=> collapsed',
            animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
         )
      ])
   ]
})
export class ConstraintsRulesComponent extends BaseDataGrid implements OnInit {
   @Input() parent: any;
   @Input() domainType: string;

   isLoadingResults: boolean;
   expandedElement: any;
   isEditable: boolean;

   constructor(
      public dialog: MatDialog,
      protected resourcesService: MdmResourcesService,
      protected messageHandler: MessageHandlerService
   ) {
      super();
      this.isLoadingResults = true;
      this.displayedColumns = ['name', 'description', 'rule', 'actions'];
      this.isEditable = true;
   }

   ngOnInit(): void {
      this.loadRules();
   }

   expandRow = (record:RuleModel) => {
      this.expandedElement = record;
      this.resourcesService.catalogueItem.listRuleRepresentations(this.domainType,this.parent.id,record.id).subscribe(result => {

         result.body.items.forEach(element => {
             element['rule'] = record;
         });

         record.rule = result.body.items;


      });
   };

   add = () => {
      const dialog = this.dialog.open(AddRuleModalComponent, {
         data: {
            name: '',
            description: '',
            modalTitle: 'Add New Rule',
            okBtn: 'Add',
            btnType: 'primary'
         },
         height: '1000px',
         width: '1000px'
      });

      dialog.afterClosed().subscribe((dialogResult) => {
         if (dialogResult) {
            const data = {
               name: dialogResult.name,
               description: dialogResult.description
            };
            this.resourcesService.catalogueItem.saveRule(this.domainType,this.parent.id,data).subscribe(
               (result) => {
                 const temp = Object.assign([],this.records);
                 temp.push(result.body);
                 this.records = temp;
                 this.totalItemCount = this.records.length;
               },
               (error) =>{
                  this.messageHandler.showError(error);
               }
            );
         } else {
            return;
         }
      });
   };

  loadRules() {
      this.resourcesService.catalogueItem
         .listRules(this.domainType, this.parent.id)
         .subscribe(
            (result) => {
               this.records = result.body.items;
               this.totalItemCount = result.body.count;
               this.isLoadingResults = false;
            },
            (error) => {
               this.messageHandler.showError(error);
               this.isLoadingResults = false;
            }
         );
   }

   openEdit(record: RuleModel): void {
      if (record) {
         const dialog = this.dialog.open(AddRuleModalComponent, {
            data: {
               name: record.name,
               description: record.description,
               modalTitle: 'Edit Rule',
               okBtn: 'Apply',
               btnType: 'primary'
            },
            height: '1000px',
            width: '1000px'
         });

         dialog.afterClosed().subscribe((dialogResult) => {
            if (dialogResult) {
               const data = {
                  name: dialogResult.name,
                  description: dialogResult.description
               };
               this.resourcesService.catalogueItem.updateRule(this.domainType,this.parent.id, record.id,data).subscribe(
                  () => {
                     this.messageHandler.showSuccess('Successfully Updated');
                     this.loadRules();
                  },
                  (error) =>{
                     this.messageHandler.showError(error);
                  }
               );
            } else {
               return;
            }
         });
      }
   }

   openEditRepresentation(rep: RuleRepresentation)
   {
      const dialog = this.dialog.open(AddRuleRepresentationModalComponent, {
         data: {
            language: rep.language,
            representation: rep.representation,
            modalTitle: 'Edit Rule Representation',
            okBtn: 'Apply',
            btnType: 'primary'
         },
         height: '1000px',
         width: '1000px'
      });

      dialog.afterClosed().subscribe((dialogResult) => {
         if (dialogResult) {
            const data = {
               language: dialogResult.language,
               representation: dialogResult.representation
            };
            this.resourcesService.catalogueItem.updateRulesRepresentation(this.domainType,this.parent.id,data, rep.rule.id, rep.id).subscribe(() => {
               this.messageHandler.showSuccess('Successfully Updated');
               this.expandRow(rep.rule);
            },
            error => {
               this.messageHandler.showError(error);
            });
         } else {
            return;
         }
      });
   }

   deleteRule = (record: RuleModel): void => {
      const dialog = this.dialog.open(ConfirmationModalComponent, {
         data: {
           title: 'Delete permanently',
           okBtnTitle: 'Yes, delete',
           btnType: 'warn',
           message : 'Are you sure you wish delete?',
         },
       });

       dialog.afterClosed().subscribe((result) => {
         if (result?.status !== 'ok') {
           return;
         }
         this.resourcesService.catalogueItem.removeRule(this.domainType,this.parent.id,record.id).subscribe(() => {
            this.messageHandler.showSuccess('Successfully Deleted');
            this.loadRules();
         },error => {
            this.messageHandler.showError(error.message);
         });
       });
   };

   addRepresentation(rule: any): void {
      const dialog = this.dialog.open(AddRuleRepresentationModalComponent, {
         data: {
            language: '',
            representation: '',
            modalTitle: 'Add New Rule Representation',
            okBtn: 'Add',
            btnType: 'primary'
         },
         height: '1000px',
         width: '1000px'
      });

      dialog.afterClosed().subscribe((dialogResult) => {
         if (dialogResult) {
            const data = {
               language: dialogResult.language,
               representation: dialogResult.representation
            };
            this.resourcesService.catalogueItem.saveRulesRepresentation(this.domainType,this.parent.id,data,rule.id).subscribe(() => {
              this.messageHandler.showSuccess('Rule Added Successfully');
              this.expandRow(rule);
            },
            error => {
               this.messageHandler.showError(error);
            });
         } else {
            return;
         }
      });
   }

   deleteRepresentation(record:RuleRepresentation){
      const dialog = this.dialog.open(ConfirmationModalComponent, {
         data: {
           title: 'Delete permanently',
           okBtnTitle: 'Yes, delete',
           btnType: 'warn',
           message : 'Are you sure you wish delete?',
         },
       });

       dialog.afterClosed().subscribe((result) => {
         if (result?.status !== 'ok') {
           return;
         }
         this.resourcesService.catalogueItem.removeRulesRepresentation(this.domainType,this.parent.id,record.rule.id, record.id).subscribe(() => {
            this.messageHandler.showSuccess('Successfully Deleted');
            this.expandRow(record.rule);
         },error => {
            this.messageHandler.showError(error.message);
         });
       });
   }
}
