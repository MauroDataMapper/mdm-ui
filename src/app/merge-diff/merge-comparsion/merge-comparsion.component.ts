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
import { Branchable, MergeItem, MergeUsed } from '@maurodatamapper/mdm-resources';
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild
} from '@angular/core';
import { FullMergeItem } from '../types/merge-item-type';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { filter } from 'rxjs/operators';
import { ConflictEditorModalComponent } from '../conflict-editor/conflict-editor-modal/conflict-editor-modal.component';
import { ConflictEditorModalData, ConflictEditorModalResult } from '../conflict-editor/conflict-editor-modal/conflict-editor-modal.model';

@Component({
  selector: 'mdm-merge-comparison',
  templateUrl: './merge-comparison.component.html',
  styleUrls: ['./merge-comparison.component.scss']
})
export class MergeComparisonComponent implements OnInit {
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

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {}

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
      .open<ConflictEditorModalComponent, ConflictEditorModalData, ConflictEditorModalResult>(
        ConflictEditorModalComponent,
        {
          disableClose: true,
          minWidth: '50%',
          maxHeight: '98vh',
          maxWidth: '98vw',
          data: {
            source: this.source,
            target: this.target,
            item: this.mergeItem
          }
        }
      )
      .afterClosed()
      .pipe(
        filter(result => result.status === ModalDialogStatus.Ok)
      )
      .subscribe(result => {
        alert(result.resolvedContent);
      });
  }

  public get MergeUsed()
  {
    return MergeUsed;
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
