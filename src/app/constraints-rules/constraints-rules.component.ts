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

export class BaseDataGrid {
  displayedColumns: string[];
  records: Array<any>;
  totalItemCount: number;
}

export class RuleRepresentation {
  id: string;
  rule: RuleModel;
  language: string;
  representation: any;
}

export class RuleModel {
  ruleRepresentations: Array<RuleRepresentation>;
  name: string;
  description: string;
  id: string;

  constructor(rule: Array<RuleRepresentation>, name: any, description: any) {
    this.ruleRepresentations = rule;
    this.name = name;
    this.description = description;
  }
}

export class RuleLanguage {
  displayName: any;
  value: any;
}

import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddRuleModalComponent } from '@mdm/modals/add-rule-modal/add-rule-modal.component';
import {
  AddRuleRepresentationModalComponent,
  RuleLanguages
} from '@mdm/modals/add-rule-representation-modal/add-rule-representation-modal.component';
import { ConfirmationModalComponent } from '@mdm/modals/confirmation-modal/confirmation-modal.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService } from '@mdm/services';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { Finalisable, Modelable } from '@maurodatamapper/mdm-resources';

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
  @Input() parent: Modelable & Finalisable;
  @Input() domainType: string;
  @Output() totalCount = new EventEmitter<string>();

  isLoadingResults: boolean;
  expandedElement: any;
  languages: Array<RuleLanguage>;
  selectedLanguage: RuleLanguage;

  clickButton = false;
  filteredOpen = false;

  canAddRules: boolean;
  canDeleteRules: boolean;

  fileExtensions = {
    'c#': 'cs',
    dmn: 'dmn',
    java: 'java',
    javascript: 'js',
    typescript: 'ts',
    text: 'txt',
    drools: 'drools',
    sql: 'sql'
  };

  constructor(
    public dialog: MatDialog,
    protected resourcesService: MdmResourcesService,
    protected messageHandler: MessageHandlerService
  ) {
    super();

    this.languages = Object.assign([], RuleLanguages.supportedLanguages);
    this.languages.sort((a:any,b:any) => {return a - b;});
    this.languages.push({ displayName: 'All', value: 'all' });
    this.isLoadingResults = true;
    this.displayedColumns = ['name', 'description', 'rule', 'actions'];
    this.selectedLanguage = this.languages.find((x) => x.value === 'all');
  }

  ngOnInit(): void {
    this.loadRules();
    this.canAddRules = !this.parent.finalised;
    this.canDeleteRules =  !this.parent.finalised;
  }

  expandRow = (record: RuleModel) => {
    if (this.expandedElement === record) {
      this.expandedElement = null;
    } else {
      this.expandedElement = record;
      this.resourcesService.catalogueItem
        .listRuleRepresentations(this.domainType, this.parent.id, record.id)
        .subscribe((result) => {
          const tempList: Array<RuleRepresentation> = [];

          result.body.items.forEach((element : RuleRepresentation) => {
            element['rule'] = record;
            if (
              this.selectedLanguage.value === 'all' ||
              this.selectedLanguage.value === element.language
            ) {
              tempList.push(element);
            }
          });

          record.ruleRepresentations = tempList;
        });
    }
  };

  add = () => {
    this.clickButton = true;
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
      this.clickButton = false;
      if (dialogResult) {
        const data = {
          name: dialogResult.name,
          description: dialogResult.description
        };
        this.resourcesService.catalogueItem
          .saveRule(this.domainType, this.parent.id, data)
          .subscribe(
            (result) => {
              const temp = Object.assign([], this.records);
              temp.push(result.body);
              this.records = temp;
              this.totalItemCount = this.records.length;
              this.totalCount.emit(String(this.totalItemCount));
            },
            (error) => {
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
          this.totalCount.emit(String(result.body.count));
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
          this.resourcesService.catalogueItem
            .updateRule(this.domainType, this.parent.id, record.id, data)
            .subscribe(
              () => {
                this.messageHandler.showSuccess('Successfully Updated');
                this.loadRules();
              },
              (error) => {
                this.messageHandler.showError(error);
              }
            );
        } else {
          return;
        }
      });
    }
  }

  openEditRepresentation(rep: RuleRepresentation) {
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
        this.resourcesService.catalogueItem
          .updateRulesRepresentation(
            this.domainType,
            this.parent.id,
            data,
            rep.rule.id,
            rep.id
          )
          .subscribe(
            () => {
              this.messageHandler.showSuccess('Successfully Updated');
              this.expandRow(rep.rule);
            },
            (error) => {
              this.messageHandler.showError(error);
            }
          );
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
        message: 'Are you sure you wish delete?'
      }
    });

    dialog.afterClosed().subscribe((result) => {
      if (result?.status !== 'ok') {
        return;
      }
      this.resourcesService.catalogueItem
        .removeRule(this.domainType, this.parent.id, record.id)
        .subscribe(
          () => {
            this.messageHandler.showSuccess('Successfully Deleted');
            this.loadRules();
          },
          (error) => {
            this.messageHandler.showError(error.message);
          }
        );
    });
  };

  addRepresentation(rule: RuleModel): void {
    const dialog = this.dialog.open(AddRuleRepresentationModalComponent, {
      data: {
        language: '',
        representation: '',
        modalTitle: 'Add Representation',
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
        this.resourcesService.catalogueItem
          .saveRulesRepresentation(
            this.domainType,
            this.parent.id,
            data,
            rule.id
          )
          .subscribe(
            () => {
              this.messageHandler.showSuccess('Rule Added Successfully');
              this.expandRow(rule);
            },
            (error) => {
              this.messageHandler.showError(error);
            }
          );
      } else {
        return;
      }
    });
  }

  deleteRepresentation(record: RuleRepresentation) {
    const dialog = this.dialog.open(ConfirmationModalComponent, {
      data: {
        title: 'Delete permanently',
        okBtnTitle: 'Yes, delete',
        btnType: 'warn',
        message: 'Are you sure you wish delete?'
      }
    });

    dialog.afterClosed().subscribe((result) => {
      if (result?.status !== 'ok') {
        return;
      }
      this.resourcesService.catalogueItem
        .removeRulesRepresentation(
          this.domainType,
          this.parent.id,
          record.rule.id,
          record.id
        )
        .subscribe(
          () => {
            this.messageHandler.showSuccess('Successfully Deleted');
            this.expandRow(record.rule);
          },
          (error) => {
            this.messageHandler.showError(error.message);
          }
        );
    });
  }

  filterClick = () => {
    this.filteredOpen = !this.filteredOpen;
  };

  exportRuleRepresentation = (ruleRep: RuleRepresentation) => {
    try {
      const myFilename = `${ruleRep.rule.name}.${
        this.fileExtensions[ruleRep.language]
      }`;
      const content = new Blob([ruleRep.representation as BlobPart]);
      FileSaver.saveAs(content, myFilename);
    } catch (error) {
      this.messageHandler.showError('Error Exporting', error);
    }
  };

  exportRule = (rule: any) => {
    const zip = new JSZip();
    let count = 0;
    const zipFilename = `${rule.name}.zip`;

    try {
      rule.ruleRepresentations.forEach((ruleRep : RuleRepresentation) => {
        if (
          this.selectedLanguage.value === ruleRep.language ||
          this.selectedLanguage.value === 'all'
        ) {
          let myFilename = `${rule.name}`;

          let fileCount = 1;
          while (
            zip.files[`${myFilename}.${this.fileExtensions[ruleRep.language]}`]
          ) {
            myFilename = `${myFilename}(${fileCount})`;
            fileCount++;
          }

          zip.file(
            `${myFilename}.${this.fileExtensions[ruleRep.language]}`,
            ruleRep.representation
          );
          count++;
          if (count === rule.ruleRepresentations.length) {
            zip.generateAsync({ type: 'blob' }).then((content) => {
              FileSaver.saveAs(content, zipFilename);
              this.messageHandler.showSuccess(`${rule.name} Exported`);
            });
          }
        }
      });
    } catch (error) {
      this.messageHandler.showError('Error Exporting', error);
    }
  };

  exportAllRules = () => {
    this.clickButton = true;
    const zip = new JSZip();
    let count = 0;
    const zipFilename = `${this.parent.label} Rules.zip`;
    try {
      this.records.forEach((rule) => {
        if (rule.ruleRepresentations) {
          rule.ruleRepresentations.forEach((ruleRep) => {
            if (
              this.selectedLanguage.value === ruleRep.language ||
              this.selectedLanguage.value === 'all'
            ) {
              let myFilename = `${rule.name}`;

              let fileCount = 1;
              while (
                zip.files[
                  `${rule.name}/${myFilename}.${
                    this.fileExtensions[ruleRep.language]
                  }`
                ]
              ) {
                myFilename = `${myFilename}(${fileCount})`;
                fileCount++;
              }

              zip
                .folder(`${rule.name}`)
                .file(
                  `${myFilename}.${this.fileExtensions[ruleRep.language]}`,
                  ruleRep.representation
                );
            }
          });
        }

        count++;
        if (count === this.records.length) {
          zip.generateAsync({ type: 'blob' }).then((content) => {
            FileSaver.saveAs(content, zipFilename);
            this.clickButton = false;
            this.messageHandler.showSuccess('All Rules Exported');
          });
        }
      });
    } catch (error) {
      this.messageHandler.showError('Error Exporting', error);
    }
  };

  selectedLanguageChange = () => {
    if (this.selectedLanguage.value === 'all') {
      this.loadRules();
      return;
    }

    const data = {
      language: this.selectedLanguage.value
    };

    this.resourcesService.catalogueItem
      .listRules(this.domainType, this.parent.id, data)
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
  };
}
