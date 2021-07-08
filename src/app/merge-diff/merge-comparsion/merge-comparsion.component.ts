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
import {
  Branchable,
  MergeItem,
  MergeType,
  MergeUsed
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
import { FullMergeItem } from '../types/merge-item-type';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { filter } from 'rxjs/operators';
import { ConflictEditorModalComponent } from '../conflict-editor/conflict-editor-modal/conflict-editor-modal.component';
import {
  ConflictEditorModalData,
  ConflictEditorModalResult
} from '../conflict-editor/conflict-editor-modal/conflict-editor-modal.model';
import { StringConflictService } from '../services/string-conflict.service';

@Component({
  selector: 'mdm-merge-comparison',
  templateUrl: './merge-comparison.component.html',
  styleUrls: ['./merge-comparison.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MergeComparisonComponent implements OnInit, OnChanges {
  @ViewChild('sourceContent') sourceContent: ElementRef;
  @ViewChild('targetContent') targetContent: ElementRef;

  @Input() source: Branchable;
  @Input() target: Branchable;
  @Input() mergeItem: FullMergeItem;
  @Input() isCommitting: boolean;

  @Output() cancelCommitEvent = new EventEmitter<MergeItem>();
  @Output() acceptCommitEvent = new EventEmitter<FullMergeItem>();
  currentElement: string;
  linkScroll = false;

  sourceUsed: string;
  committingContent: string;
  sourceText: string;
  targetText: string;

  constructor(private dialog: MatDialog, private stringConflict : StringConflictService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(changes: SimpleChanges): void {
    if (this.isCommitting) {
      this.sourceUsed = this.mergeItem.branchSelected;
      switch (this.mergeItem.branchSelected) {
        case MergeUsed.Mixed:
          this.committingContent = this.mergeItem.mixedContent;
          this.sourceUsed = 'Mixed';
          break;
        case MergeUsed.Target:
          this.committingContent = this.mergeItem.targetValue;
          this.sourceUsed = 'Target';
          break;
        default:
          this.committingContent = this.mergeItem.sourceValue;
          this.sourceUsed = 'Source';
          break;
      }
    }else{
      this.targetText = this.stringConflict.getDiffViewHtml(this.mergeItem.sourceValue,this.mergeItem.targetValue);
      this.sourceText = this.stringConflict.getDiffViewHtml(this.mergeItem.targetValue,this.mergeItem.sourceValue);
    }
  }

  ngOnInit(): void {

  }

  cancelCommit() {
    this.cancelCommitEvent.emit(this.mergeItem);
  }

  acceptCommit(branchUsed: MergeUsed) {
    this.mergeItem.branchSelected = branchUsed;
    this.acceptCommitEvent.emit(this.mergeItem);
  }

  openEditor() {
    // TODO: add in possible other editors, not just strings
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
          item: this.mergeItem
        }
      })
      .afterClosed()
      .pipe(filter((result) => result.status === ModalDialogStatus.Ok))
      .subscribe((result: ConflictEditorModalResult) => {
        if (result.status === ModalDialogStatus.Ok) {
          this.mergeItem.mixedContent = result.resolvedContent;
          this.mergeItem.branchSelected = MergeUsed.Mixed;
          this.acceptCommitEvent.emit(this.mergeItem);
        }
      });
  }

  public get MergeUsed() {
    return MergeUsed;
  }

  public get MergeType() {
    return MergeType;
  }

  updateVerticalScroll(event): void {
    if (this.linkScroll) {
      if (this.currentElement === 'targetContent') {
        this.sourceContent.nativeElement.scrollTop = event.target.scrollTop;
      } else if (this.currentElement === 'sourceContent') {
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
}
