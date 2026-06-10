/*
Copyright 2020-2026 University of Oxford and NHS England

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
  Branchable,
  MergeDiffItem,
  MergeDiffType,
  MergeConflictResolution
} from '@maurodatamapper/mdm-resources';
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { MergeDiffItemModel, MergeItemValueType } from '../types/merge-item-type';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { filter } from 'rxjs/operators';
import { ConflictEditorModalComponent } from '../conflict-editor/conflict-editor-modal/conflict-editor-modal.component';
import {
  ConflictEditorModalData,
  ConflictEditorModalResult
} from '../conflict-editor/conflict-editor-modal/conflict-editor-modal.model';
import { StringConflictService } from '../services/string-conflict.service';
import { SafePipe } from '@mdm/content/safe.pipe';
import { LocationPathComponent } from '@mdm/shared/location-path/location-path.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'mdm-merge-comparison',
    templateUrl: './merge-comparison.component.html',
    styleUrls: ['./merge-comparison.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [CommonModule, MatButtonModule, LocationPathComponent, SafePipe]
})
export class MergeComparisonComponent implements OnInit, OnChanges {
  @ViewChild('sourceContent') sourceContent: ElementRef;
  @ViewChild('targetContent') targetContent: ElementRef;

  @Input() source: Branchable;
  @Input() target: Branchable;
  @Input() mergeItem: MergeDiffItemModel;

  @Output() cancelCommitEvent = new EventEmitter<MergeDiffItem>();
  @Output() acceptCommitEvent = new EventEmitter<MergeDiffItemModel>();
  currentElement: string;
  linkScroll = false;

  sourceText: string;
  targetText: string;
  valueType: MergeItemValueType;
  simpleDisplayText: string;

  get hasSourceValue() {
    // Possible that value is the number 0, which we don't want to consider to be "falsy"
    return this.mergeItem?.sourceValue !== undefined && this.mergeItem?.sourceValue !== null;
  }

  get hasTargetValue() {
    // Possible that value is the number 0, which we don't want to consider to be "falsy"
    return this.mergeItem?.targetValue !== undefined && this.mergeItem?.targetValue !== null;
  }

  get isApplied() {
    return this.mergeItem?.branchSelected !== null
      && this.mergeItem?.branchSelected !== MergeConflictResolution.Target;
  }

  get isModification() {
    return this.mergeItem?.type === MergeDiffType.Modification;
  }

  get isCreation() {
    return this.mergeItem?.type === MergeDiffType.Creation;
  }

  get isDeletion() {
    return this.mergeItem?.type === MergeDiffType.Deletion;
  }

  constructor(private dialog: MatDialog, private stringConflict: StringConflictService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(changes: SimpleChanges): void {
    if (this.mergeItem) {
      this.valueType = this.identifyValueType();
      this.sourceText = this.getComparisonDisplayText(this.mergeItem.sourceValue, this.mergeItem.targetValue);
      this.targetText = this.getComparisonDisplayText(this.mergeItem.targetValue, this.mergeItem.sourceValue);
      this.simpleDisplayText = this.getSimpleDisplayText();
    }
  }

  ngOnInit(): void { }

  cancelCommit() {
    this.cancelCommitEvent.emit(this.mergeItem);
  }

  acceptCommit(branchUsed: MergeConflictResolution) {
    this.mergeItem.branchSelected = branchUsed;
    this.acceptCommitEvent.emit(this.mergeItem);
  }

  openEditor() {
    this.dialog
      .open<
        ConflictEditorModalComponent,
        ConflictEditorModalData,
        ConflictEditorModalResult
      >(ConflictEditorModalComponent, {
        disableClose: true,
        minWidth: '50%',
        maxHeight: '98vh',
        maxWidth: '98vw',
        data: {
          source: this.source,
          target: this.target,
          item: this.mergeItem,
          valueType: this.valueType
        }
      })
      .afterClosed()
      .pipe(filter(result => result.status === ModalDialogStatus.Ok))
      .subscribe((result: ConflictEditorModalResult) => {
          this.mergeItem.mixedContent = result.resolvedContent;
          this.mergeItem.branchSelected = MergeConflictResolution.Mixed;
          this.simpleDisplayText = this.getSimpleDisplayText();
          this.acceptCommitEvent.emit(this.mergeItem);
      });
  }

  public get MergeUsed() {
    return MergeConflictResolution;
  }

  public get MergeType() {
    return MergeDiffType;
  }

  getDetailTitle(): string {
    switch (this.mergeItem?.type) {
      case MergeDiffType.Creation:
        return 'Create';
      case MergeDiffType.Deletion:
        return 'Delete';
      case MergeDiffType.Modification:
        return 'Modify';
      default:
        return '';
    }
  }

  getCurrentStatus(): string {
    if (this.mergeItem?.branchSelected === MergeConflictResolution.Mixed) {
      return 'Mixed resolution';
    }

    return this.isApplied ? 'Applied' : 'Skipped';
  }

  getSimpleBranchLabel(): string {
    if (this.isCreation) {
      return `After · ${this.source.branchName}`;
    }

    if (this.isDeletion) {
      return `Before · ${this.target.branchName}`;
    }

    return this.mergeItem?.branchSelected === MergeConflictResolution.Mixed
      ? 'Resolved content'
      : `Selected · ${this.mergeItem?.branchNameSelected ?? this.target.branchName}`;
  }

  getBeforeBranchLabel(): string {
    return `Before · ${this.target.branchName}`;
  }

  getAfterBranchLabel(): string {
    if (this.mergeItem?.branchSelected === MergeConflictResolution.Mixed) {
      return 'After · Mixed resolution';
    }

    return `After · ${this.source.branchName}`;
  }

  getAfterHtml(): string {
    if (this.mergeItem?.branchSelected === MergeConflictResolution.Mixed && this.mergeItem?.mixedContent) {
      return this.getComparisonDisplayText(this.mergeItem.mixedContent, this.mergeItem.targetValue);
    }

    return this.sourceText;
  }

  updateVerticalScroll(event): void {
    if (this.linkScroll) {
      if (this.currentElement === 'targetContent') {
        this.sourceContent.nativeElement.scrollTop = event.target.scrollTop;
      }
 else if (this.currentElement === 'sourceContent') {
        this.targetContent.nativeElement.scrollTop = event.target.scrollTop;
      }
    }
  }

  updateCurrentElement(element: 'sourceContent' | 'targetContent') {
    this.currentElement = element;
  }

  linkScrolls(link: boolean) {
    this.linkScroll = link;
  }

  private identifyValueType(): MergeItemValueType {
    if (!this.hasSourceValue && !this.hasTargetValue) {
      return 'undefined';
    }

    const value = this.hasSourceValue ? this.mergeItem.sourceValue : this.mergeItem.targetValue;
    if (value === undefined || value === null) {
      // Don't want "0" to be a "falsy" value
      return 'undefined';
    }

    if (typeof value === 'number') {
      return 'number';
    }

    return 'string';
  }

  private getComparisonDisplayText(value: string, other: string) {
    if (this.valueType === 'undefined' || value === undefined || value === null) {
      return '<code>Not defined</code>';
    }

    if (this.valueType === 'number') {
      return `${value}`;
    }

    // Assume the value is a string
    return this.stringConflict.getDiffViewHtml(other, value);
  }

  private getSimpleDisplayText(): string {
    if (this.mergeItem?.branchSelected === MergeConflictResolution.Mixed && this.mergeItem?.mixedContent) {
      return this.getPlainDisplayText(this.mergeItem.mixedContent);
    }

    if (this.isCreation) {
      return this.getPlainDisplayText(this.mergeItem?.sourceValue);
    }

    if (this.isDeletion) {
      return this.getPlainDisplayText(this.mergeItem?.targetValue);
    }

    if (this.mergeItem?.branchSelected === MergeConflictResolution.Target) {
      return this.getPlainDisplayText(this.mergeItem?.targetValue);
    }

    return this.getPlainDisplayText(this.mergeItem?.sourceValue);
  }

  private getPlainDisplayText(value: unknown): string {
    if (value === undefined || value === null || value === '') {
      return 'Not defined';
    }

    return `${value}`;
  }
}
