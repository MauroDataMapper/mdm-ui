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
import { Component, Input, OnInit } from '@angular/core';
import { Branchable, MergeItem } from '@maurodatamapper/mdm-resources';
import { diff_match_patch } from 'diff-match-patch';

@Component({
  selector: 'mdm-string-conflict-editor',
  templateUrl: './string-conflict-editor.component.html',
  styleUrls: ['./string-conflict-editor.component.scss']
})
export class StringConflictEditorComponent implements OnInit {
  @Input() source: Branchable;
  @Input() target: Branchable;
  @Input() item: MergeItem;

  sourceText: string;
  targetText: string;

  private dmp = new diff_match_patch();

  constructor() { }

  ngOnInit(): void {
    this.sourceText = this.getDiffPrettyHtml(this.item.targetValue, this.item.sourceValue);
    this.targetText = this.getDiffPrettyHtml(this.item.sourceValue, this.item.targetValue);
  }

  private getDiffPrettyHtml(text1: string, text2: string) {
    const diffs = this.dmp.diff_main(text1, text2);
    this.dmp.diff_cleanupSemantic(diffs);
    // Prettify and remove pilcrow (¶ paragraph marks) from the output
    return this.dmp.diff_prettyHtml(diffs).replace(/&para;/g, '');
  }
}
