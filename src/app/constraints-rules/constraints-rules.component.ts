/*
Copyright 2020-2023 University of Oxford and NHS England

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
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../services/shared.service';
import {
  AddRuleModalComponent,
  AddRuleModalConfig,
  AddRuleModalResult
} from '@mdm/modals/add-rule-modal/add-rule-modal.component';
import {
  AddRuleRepresentationModalComponent,
  AddRuleRepresentationModalConfig,
  AddRuleRepresentationModalResult,
  RuleLanguage,
  supportedLanguages
} from '@mdm/modals/add-rule-representation-modal/add-rule-representation-modal.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { catchError, filter, finalize, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '@mdm/services';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import {
  FilterQueryParameters,
  Finalisable,
  Modelable,
  Rule,
  RuleDomainType,
  RuleIndexResponse,
  RulePayload,
  RuleRepresentation,
  RuleRepresentationPayload,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { EditingService } from '@mdm/services/editing.service';
import { EMPTY } from 'rxjs';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

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
export class ConstraintsRulesComponent implements OnInit {
  @Input() parent: Modelable & Finalisable;
  @Input() domainType: RuleDomainType;
  @Output() totalCount = new EventEmitter<string>();

  displayedColumns = ['name', 'description', 'representations', 'actions'];
  records: Rule[];
  totalItemCount: number;

  isLoadingResults: boolean;
  expandedRuleId: Uuid;
  languages: RuleLanguage[];
  selectedLanguage: RuleLanguage;

  clickButton = false;
  filteredOpen = false;
  isLoggedIn = false;

  canAddRules: boolean;
  canDeleteRules: boolean;

  constructor(
    public dialog: MatDialog,
    private editing: EditingService,
    private sharedService: SharedService,
    protected resourcesService: MdmResourcesService,
    protected messageHandler: MessageHandlerService
  ) {
    this.languages = Object.assign([], supportedLanguages);
    this.languages.sort((a, b) => a.displayName.localeCompare(b.displayName));
    this.languages.push({ displayName: 'All', value: 'all' });
    this.isLoadingResults = true;
    this.selectedLanguage = this.languages.find((x) => x.value === 'all');
    this.isLoggedIn = this.sharedService.isLoggedIn();
  }

  ngOnInit(): void {
    this.loadRules();
    this.canAddRules = !this.parent.finalised;
    this.canDeleteRules = !this.parent.finalised;
  }

  expandRow(record: Rule) {
    if ((record.ruleRepresentations?.length ?? 0) === 0) {
      return;
    }

    this.expandedRuleId = this.expandedRuleId === record.id ? null : record.id;
  }

  add() {
    this.showRuleDialog('add');
  }

  loadRules() {
    this.resourcesService.catalogueItem
      .listRules(this.domainType, this.parent.id)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(error);
          return EMPTY;
        }),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe((response: RuleIndexResponse) => {
        this.records = response.body.items;
        this.totalItemCount = response.body.count;
        this.totalCount.emit(String(response.body.count));
      });
  }

  openEdit(rule: Rule) {
    if (!rule) {
      return;
    }

    this.showRuleDialog('edit', rule);
  }

  openEditRepresentation(rule: Rule, rep: RuleRepresentation) {
    if (!rep) {
      return;
    }

    this.showRepresentationDialog('edit', rule, rep);
  }

  deleteRule(rule: Rule) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Delete rule',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `Are you sure you wish to delete the rule '${rule.name}'?`
        }
      })
      .pipe(
        switchMap(() =>
          this.resourcesService.catalogueItem.removeRule(
            this.domainType,
            this.parent.id,
            rule.id
          )
        ),
        catchError((error) => {
          this.messageHandler.showError(error.message);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess('Rule was successfully deleted.');
        this.loadRules();
      });
  }

  addRepresentation(rule: Rule) {
    this.showRepresentationDialog('add', rule);
  }

  deleteRepresentation(rule: Rule, record: RuleRepresentation) {
    this.dialog
      .openConfirmationAsync({
        data: {
          title: 'Delete rule representation',
          okBtnTitle: 'Yes, delete',
          btnType: 'warn',
          message: `Are you sure you wish to delete the rule representation '${record.language}' for the rule '${rule.name}'?`
        }
      })
      .pipe(
        switchMap(() =>
          this.resourcesService.catalogueItem.removeRuleRepresentation(
            this.domainType,
            this.parent.id,
            rule.id,
            record.id
          )
        ),
        catchError((error) => {
          this.messageHandler.showError(error.message);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          'Rule representation was successfully deleted.'
        );
        this.loadRules();
      });
  }

  filterClick() {
    this.filteredOpen = !this.filteredOpen;
  }

  exportRuleRepresentation(rule: Rule, rep: RuleRepresentation) {
    try {
      const myFilename = `${rule.name}.${this.getFileExtension(rep.language)}`;
      const content = new Blob([rep.representation as BlobPart]);
      FileSaver.saveAs(content, myFilename);
    } catch (error) {
      this.messageHandler.showError('Error Exporting', error);
    }
  }

  exportRule(rule: Rule) {
    const zip = new JSZip();
    let count = 0;
    const zipFilename = `${rule.name}.zip`;

    try {
      rule.ruleRepresentations.forEach((ruleRep: RuleRepresentation) => {
        if (
          this.selectedLanguage.value === ruleRep.language ||
          this.selectedLanguage.value === 'all'
        ) {
          let myFilename = `${rule.name}`;

          let fileCount = 1;
          while (
            zip.files[
              `${myFilename}.${this.getFileExtension(ruleRep.language)}`
            ]
          ) {
            myFilename = `${myFilename}(${fileCount})`;
            fileCount++;
          }

          zip.file(
            `${myFilename}.${this.getFileExtension(ruleRep.language)}`,
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
  }

  exportAllRules() {
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
                  `${rule.name}/${myFilename}.${this.getFileExtension(
                    ruleRep.language
                  )}`
                ]
              ) {
                myFilename = `${myFilename}(${fileCount})`;
                fileCount++;
              }

              zip
                .folder(`${rule.name}`)
                .file(
                  `${myFilename}.${this.getFileExtension(ruleRep.language)}`,
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
  }

  selectedLanguageChange() {
    if (this.selectedLanguage.value === 'all') {
      this.loadRules();
      return;
    }

    const query: FilterQueryParameters = {
      language: this.selectedLanguage.value
    };

    this.resourcesService.catalogueItem
      .listRules(this.domainType, this.parent.id, query)
      .pipe(
        catchError((error) => {
          this.messageHandler.showError(error);
          return EMPTY;
        }),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe((response: RuleIndexResponse) => {
        this.records = response.body.items;
        this.totalItemCount = response.body.count;
      });
  }

  private getFileExtension(language: string) {
    const lang = supportedLanguages.find((l) => l.value === language);
    return lang?.fileExt;
  }

  private showRuleDialog(mode: 'add' | 'edit', current?: Rule) {
    this.clickButton = true;

    this.editing
      .openDialog<
        AddRuleModalComponent,
        AddRuleModalConfig,
        AddRuleModalResult
      >(AddRuleModalComponent, {
        data: {
          ...(current as RulePayload),
          title: mode === 'edit' ? 'Edit Rule' : 'Add Rule',
          okBtnTitle: mode === 'edit' ? 'Apply' : 'Create',
          btnType: 'primary'
        },
        width: '1000px'
      })
      .afterClosed()
      .pipe(
        filter((result) => result.status === ModalDialogStatus.Ok),
        switchMap((result) => {
          if (mode === 'edit' && current) {
            return this.resourcesService.catalogueItem.updateRule(
              this.domainType,
              this.parent.id,
              current.id,
              { name: result.name, description: result.description }
            );
          }

          return this.resourcesService.catalogueItem.saveRule(
            this.domainType,
            this.parent.id,
            { name: result.name, description: result.description }
          );
        }),
        catchError((error) => {
          this.messageHandler.showError(
            `There was a problem ${
              mode === 'edit' ? 'updating' : 'creating'
            } the rule.`,
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.clickButton = false))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          `Rule was successfully ${mode === 'edit' ? 'updated' : 'created'}.`
        );
        this.loadRules();
      });
  }

  private showRepresentationDialog(
    mode: 'add' | 'edit',
    rule: Rule,
    current?: RuleRepresentation
  ) {
    this.clickButton = true;

    this.editing
      .openDialog<
        AddRuleRepresentationModalComponent,
        AddRuleRepresentationModalConfig,
        AddRuleRepresentationModalResult
      >(AddRuleRepresentationModalComponent, {
        data: {
          ...(current as RuleRepresentationPayload),
          title: mode === 'edit' ? 'Edit Representation' : 'Add Representation',
          okBtnTitle: mode === 'edit' ? 'Apply' : 'Create',
          btnType: 'primary'
        },
        width: '65%',
        maxHeight: '98vh',
        maxWidth: '98vw'
      })
      .afterClosed()
      .pipe(
        filter((result) => result.status === ModalDialogStatus.Ok),
        switchMap((result) => {
          if (mode === 'edit' && current) {
            return this.resourcesService.catalogueItem.updateRuleRepresentation(
              this.domainType,
              this.parent.id,
              rule.id,
              current.id,
              {
                language: result.language,
                representation: result.representation
              }
            );
          }

          return this.resourcesService.catalogueItem.saveRuleRepresentation(
            this.domainType,
            this.parent.id,
            rule.id,
            { language: result.language, representation: result.representation }
          );
        }),
        catchError((error) => {
          this.messageHandler.showError(
            `There was a problem ${
              mode === 'edit' ? 'updating' : 'creating'
            } the rule representation.`,
            error
          );
          return EMPTY;
        }),
        finalize(() => (this.clickButton = false))
      )
      .subscribe(() => {
        this.messageHandler.showSuccess(
          `Rule representation was successfully ${
            mode === 'edit' ? 'updated' : 'created'
          }.`
        );
        this.expandedRuleId = rule.id;
        this.loadRules();
      });
  }
}
