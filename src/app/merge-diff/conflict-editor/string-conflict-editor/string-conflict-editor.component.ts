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
import { AfterViewInit, Component, ElementRef, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Branchable, MergeItem } from '@maurodatamapper/mdm-resources';
import { Diff, diff_match_patch } from 'diff-match-patch';

const diffType = 0;
const diffValue = 1;
const deletedType = -1;
const equalType = 0;
const insertedType = 1;
const conflictText = '---';

interface DiffTrackedItem {
  diffs: Diff[];
  index: number;
  value: string;
}

type DiffHtmlTransformFunction = (item: DiffTrackedItem) => string;

@Component({
  selector: 'mdm-string-conflict-editor',
  templateUrl: './string-conflict-editor.component.html',
  styleUrls: ['./string-conflict-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StringConflictEditorComponent implements OnInit, AfterViewInit {
  @Input() source: Branchable;
  @Input() target: Branchable;
  @Input() item: MergeItem;

  @ViewChild('sourceView') sourceView: ElementRef;
  @ViewChild('targetView') targetView: ElementRef;

  sourceText: string;
  targetText: string;
  resolvedText: string;

  private dmp = new diff_match_patch();

  constructor() { }

  ngOnInit(): void {
    this.sourceText = this.getDiffViewHtml(
      this.item.targetValue,
      this.item.sourceValue);

    this.targetText = this.getDiffViewHtml(
      this.item.sourceValue,
      this.item.targetValue);

    // Initially the resolved text will look like the source text but with waiting conflict markers
    // instead of highlights
    this.resolvedText = this.initialiseResolvedDiffHtml(
      this.item.targetValue,
      this.item.sourceValue);
  }

  ngAfterViewInit(): void {
    this.setDiffViewEventListeners(this.sourceView);
    this.setDiffViewEventListeners(this.targetView);
  }

  resolveDiffConflict(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const id = JSON.parse(target.dataset.diffId) as number;
    const value = decodeURI(target.dataset.diffValue);

    const resolvedDocument = new DOMParser()
      .parseFromString(this.resolvedText, 'text/html');

    resolvedDocument.body
      .querySelectorAll(`span.diff-marker[data-diff-id="${id}"`)
      .forEach(element => {
        element.innerHTML = value;
        element.setAttribute('title', 'resolved');
        element.classList.replace('conflict', 'resolved');
      });

    this.resolvedText = resolvedDocument.body.innerHTML;
  }

  getCurrentConflictCount() {
    const resolvedDocument = new DOMParser()
      .parseFromString(this.resolvedText, 'text/html');

    const conflicts = resolvedDocument.body.querySelectorAll('span.diff-marker.conflict');
    return conflicts.length;
  }

  getFinalResolvedContent() {
    const resolvedDocument = new DOMParser()
      .parseFromString(this.resolvedText, 'text/html');

    resolvedDocument.body
      .querySelectorAll('span.diff-marker')
      .forEach(element => {
        const newElement = resolvedDocument.createTextNode(element.innerHTML);
        element.parentNode.replaceChild(newElement, element);
      });

    return resolvedDocument.body.innerHTML;
  }

  private getDiffViewHtml(
    text1: string,
    text2: string) {
    const diffs = this.getDiff(text1, text2);
    return this.getDiffPrettyHtml(
      diffs,
      this.createInsElement.bind(this),
      () => '');
  }

  private initialiseResolvedDiffHtml(
    text1: string,
    text2: string) {
    const diffs = this.getDiff(text1, text2);
    return this.getDiffPrettyHtml(
      diffs,
      this.checkInsertedTextForResolve.bind(this),
      this.checkDeletedTextForResolve.bind(this));
  }

  private setDiffViewEventListeners(view: ElementRef) {
    view.nativeElement
      .querySelectorAll('ins')
      .forEach(elem => elem.addEventListener('click', this.resolveDiffConflict.bind(this)));
  }

  private getDiff(text1: string, text2: string) {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);
    return diffs;
  }

  private getDiffPrettyHtml(
    diffs: Diff[],
    insertedTransformFn: DiffHtmlTransformFunction,
    deletedTransformFn: DiffHtmlTransformFunction) {
    return diffs
      .map((diff, index) => {
        const type = diff[diffType];
        const value = this.sanitizeForHtml(diff[diffValue]);

        switch (type) {
          case insertedType: {
            return insertedTransformFn({ diffs, index, value });
          }
          case deletedType: {
            return deletedTransformFn({ diffs, index, value });
          }
          case equalType: {
            return value;
          }
          default: {
            return '';
          }
        }
      })
      .join('');
  }

  private createInsElement(item: DiffTrackedItem) {
    // In read-only diff views, the <ins> element will be the highlight marker showing the change.
    // Record the diff data and later a click handler will be attached to handle transitioning this
    // diff to the resolved text
    return `<ins data-diff-id="${item.index}" data-diff-value="${encodeURI(item.value)}"
      title="Click to include in resolved text">${item.value}</ins>`;
  }

  private checkInsertedTextForResolve(item: DiffTrackedItem) {
    const previousIndex = item.index - 1;
    if (previousIndex >= 0) {
      const previousType = item.diffs[previousIndex][diffType];
      if (previousType === deletedType) {
        // Part of a diff pair of "delete" followed by "insert". This represents a conflict that
        // must be manually resolved
        return this.createResolveMarker('conflict', item.index);
      }
    }

    // Otherwise, the inserted change only exists on the left side, so this can automatically be
    // resolved.
    return this.createResolveMarker('resolved', item.index, item.value);
  }

  private checkDeletedTextForResolve(item: DiffTrackedItem) {
    const nextIndex = item.index + 1;
    if (nextIndex < item.diffs.length) {
      const nextType = item.diffs[nextIndex][diffType];
      if (nextType === insertedType) {
        // Part of a diff pair of "delete" followed by "insert". Return nothing here because
        // checkInsertedTextForResolve() will handle this.
        return '';
      }
    }

    // Text only appears in left hand side, so may have been intentionally deleted from the target.
    // Must get manual confirmation to resolve correctly
    return this.createResolveMarker('conflict', item.index);
  }

  private createResolveMarker(markerType: 'conflict' | 'resolved', id: number, value?: string) {
    // In writeable diff views, this acts as the placeholder/marker to inserting the resolved diff.
    // Use the same diff ID as the readable views, and assign the correct CSS class for now to highlight
    // correctly (the click handler will swap this to as appropriate).
    return `<span class="diff-marker ${markerType}" data-diff-id="${id}" title="${markerType}">${markerType === 'conflict' ? conflictText : value}</span>`;
  }

  private sanitizeForHtml(value: string) {
    return value.replace(/\n/g, '<br/>');
  }
}
