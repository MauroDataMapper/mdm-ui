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

import { Injectable } from '@angular/core';
import { Diff, diff_match_patch } from 'diff-match-patch';

interface DiffTrackedItem {
  diffs: Diff[];
  index: number;
  value: string;
}

type DiffHtmlTransformFunction = (item: DiffTrackedItem) => string;

const diffType = 0;
const diffValue = 1;
const deletedType = -1;
const equalType = 0;
const insertedType = 1;

@Injectable({
  providedIn: 'root'
})
export class StringConflictService {
  private dmp = new diff_match_patch();

  constructor() {}

  getDiffViewHtml(text1: string, text2: string) {
    const diffs = this.getDiff(text1 ?? '', text2 ?? '');
    return this.getDiffPrettyHtml(
      diffs,
      this.createInsElement.bind(this),
      () => ''
    );
  }

  getDiffPrettyHtml(
    diffs: Diff[],
    insertedTransformFn: DiffHtmlTransformFunction,
    deletedTransformFn: DiffHtmlTransformFunction
  ) {
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

  getDiff(text1: string, text2: string) {
    const diffs = this.dmp.diff_main(text1 ?? '', text2 ?? '');
    this.dmp.diff_cleanupSemantic(diffs);
    return diffs;
  }

  private createInsElement(item: DiffTrackedItem) {
    // In read-only diff views, the <ins> element will be the highlight marker showing the change.
    // Record the diff data and later a click handler will be attached to handle transitioning this
    // diff to the resolved text
    return `<ins data-diff-id="${item.index}" data-diff-value="${encodeURI(
      item.value
    )}"
      title="Click to include in resolved text">${item.value}</ins>`;
  }

  private sanitizeForHtml(value: string) {
    return value.replace(/\n/g, '<br/>');
  }
}
