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
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Branchable, MergeItem } from '@maurodatamapper/mdm-resources';
import { Diff, diff_match_patch } from 'diff-match-patch';

const diffType = 0;
const diffValue = 1;
const deletedText = -1;
const equalText = 0;
const insertedText = 1;
const insertedTextBackgroundColor = '#e6ffe6'

@Component({
  selector: 'mdm-string-conflict-editor',
  templateUrl: './string-conflict-editor.component.html',
  styleUrls: ['./string-conflict-editor.component.scss']
})
export class StringConflictEditorComponent implements OnInit, AfterViewInit {
  @Input() source: Branchable;
  @Input() target: Branchable;
  @Input() item: MergeItem;

  @ViewChild('sourceView') sourceView: ElementRef;
  @ViewChild('targetView') targetView: ElementRef;

  sourceText: string;
  targetText: string;

  private dmp = new diff_match_patch();

  constructor() { }

  ngOnInit(): void {
    this.sourceText = this.getDiffViewHtml(this.item.targetValue, this.item.sourceValue);
    this.targetText = this.getDiffViewHtml(this.item.sourceValue, this.item.targetValue);
  }

  ngAfterViewInit(): void {
    this.setDiffViewEventListeners(this.sourceView);
    this.setDiffViewEventListeners(this.targetView);
  }

  private getDiffViewHtml(text1: string, text2: string) {
    const diffs = this.getDiff(text1, text2);
    return this.getDiffPrettyHtml(diffs);
  }

  private setDiffViewEventListeners(view: ElementRef) {
    view.nativeElement
      .querySelectorAll('ins')
      .forEach(ins => ins.addEventListener('click', this.test.bind(this)));
  }

  private getDiff(text1: string, text2: string) {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);
    return diffs.filter(d => d[diffType] !== deletedText);
  }

  test() {
    alert('Hello');
  }

  private getDiffPrettyHtml(diffs: Diff[]) {
    return diffs
      .map((diff, index) => {
        const type = diff[diffType];
        const value = this.sanitizeForHtml(diff[diffValue]);

        switch (type) {
          case insertedText: {
            const obj = { id: index, loc: 'left', value: encodeURI(value) };
            return `<ins id="${index}" data-diff="${JSON.stringify(obj)}" title="Click to include in resolved text"
            style="background-color:${insertedTextBackgroundColor};cursor:pointer">${value}</ins>`;
          }
          case equalText: {
            return value;
          }
          default: {
            return '';
          }
        }
      })
      .join('');
  }

  private sanitizeForHtml(value: string) {
    return value.replace(/\n/g, '<br/>');
  }
}
