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
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Branchable, MergeItem } from '@maurodatamapper/mdm-resources';
import { Diff, diff_match_patch } from 'diff-match-patch';

const diffType = 0;
const diffValue = 1;
const deletedType = -1;
const equalType = 0;
const insertedType = 1;
const conflictText = '---';

type DiffHtmlTransformFunction = (index: number, value: string) => string;
type DiffHandlerFunction = (diffs: Diff[]) => void;

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
  conflictCount = 0;

  private dmp = new diff_match_patch();

  constructor() { }

  ngOnInit(): void {
    this.sourceText = this.getDiffViewHtml(
      this.item.targetValue,
      this.item.sourceValue,
      this.createInsElement);

    this.targetText = this.getDiffViewHtml(
      this.item.sourceValue,
      this.item.targetValue,
      this.createInsElement);

    // Initially the resolved text will look like the source text but with waiting conflict markers
    // instead of highlights
    this.resolvedText = this.getDiffViewHtml(
      this.item.targetValue,
      this.item.sourceValue,
      this.createResolveMarker,
      diffs => this.conflictCount = diffs.filter(d => d[diffType] !== equalType).length);
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
        element.classList.replace('conflict', 'resolved');
      });

    this.resolvedText = resolvedDocument.body.innerHTML;

    this.conflictCount = resolvedDocument.body
      .querySelectorAll('span.diff-marker.conflict')
      .length;
  }

  private getDiffViewHtml(
    text1: string,
    text2: string,
    insertedTransformFn: DiffHtmlTransformFunction,
    diffHandler?: DiffHandlerFunction) {
    const diffs = this.getDiff(text1, text2);
    if (diffHandler) {
      diffHandler(diffs);
    }
    return this.getDiffPrettyHtml(diffs, insertedTransformFn);
  }

  private setDiffViewEventListeners(view: ElementRef) {
    view.nativeElement
      .querySelectorAll('ins')
      .forEach(elem => elem.addEventListener('click', this.resolveDiffConflict.bind(this)));
  }

  private getDiff(text1: string, text2: string) {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);
    return diffs.filter(d => d[diffType] !== deletedType);
  }

  private getDiffPrettyHtml(diffs: Diff[], insertedTransformFn: DiffHtmlTransformFunction) {
    return diffs
      .map((diff, index) => {
        const type = diff[diffType];
        const value = this.sanitizeForHtml(diff[diffValue]);

        switch (type) {
          case insertedType: {
            return insertedTransformFn(index, value);
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

  private createInsElement(index: number, value: string) {
    // In read-only diff views, the <ins> element will be the highlight marker showing the change.
    // Record the diff data and later a click handler will be attached to handle transitioning this
    // diff to the resolved text
    return `<ins id="${index}" data-diff-id="${index}" data-diff-value="${encodeURI(value)}"
      title="Click to include in resolved text">${value}</ins>`;
  }

  private createResolveMarker(index: number, _: string) {
    // In writeable diff views, this will acts as the placeholder/marker to inserting the resolved diff.
    // Use the same diff ID as the readable views, and assign the "conflict" CSS class for now to highlight
    // correctly (the click handler will swap this to "resolved").
    return `<span class="diff-marker conflict" data-diff-id="${index}">${conflictText}</span>`;
  }

  private sanitizeForHtml(value: string) {
    return value.replace(/\n/g, '<br/>');
  }
}
