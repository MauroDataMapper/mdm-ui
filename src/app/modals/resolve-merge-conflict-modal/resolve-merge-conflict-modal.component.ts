/*
Copyright 2020 University of Oxford

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

import { Component, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import DiffMatchPatch from 'diff-match-patch';

@Component({
  selector: 'mdm-resolve-merge-conflict-modal',
  templateUrl: './resolve-merge-conflict-modal.component.html',
  styleUrls: ['./resolve-merge-conflict-modal.component.scss']
})
export class ResolveMergeConflictModalComponent implements AfterViewInit {

  private mergeViewrl : ElementRef;
  private mergeViewlr : ElementRef;

  @ViewChild('mergeDiffrl', {static:false}) set mergeDiffConRl(content: ElementRef) {
    this.mergeViewrl = content;
  }

  @ViewChild('mergeDifflr', {static:false}) set mergeDiffConLR(content: ElementRef) {
    this.mergeViewlr = content;
  }

  mergeString:any;
  mergeDiffrl: any;
  mergeDifflr: any;

  constructor(
    private dialogRef: MatDialogRef<ResolveMergeConflictModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngAfterViewInit(): void {
    if (this.data.diffs) {
      const diffs = this.data.diffs;
      const diffrl = this.diff_lineMode(diffs.right, diffs.left);
      const difflr = this.diff_lineMode(diffs.left, diffs.right);


      this.mergeViewrl.nativeElement.innerHTML = this.diff_prettyPlain(diffrl);
      this.mergeViewlr.nativeElement.innerHTML = this.diff_prettyPlain(difflr);

      this.mergeViewrl.nativeElement.querySelectorAll('button').forEach(x => x.addEventListener('click', this.onMergeConflictPress.bind(this)));
      this.mergeViewlr.nativeElement.querySelectorAll('button').forEach(x => x.addEventListener('click', this.onMergeConflictPress.bind(this)));


      this.mergeString = this.diff_into_prettyPlain(difflr);
    }
  }

  accept() {
    this.data.mergeString = this.mergeString;
    this.dialogRef.close({ status: 'ok' ,  data : this.data });
  }

  onMergeConflictPress(thing:any)
  {
    const item = thing.currentTarget;
    const obj = JSON.parse(item.attributes.test.value);
    const id = obj.id;
    const value = decodeURI(obj.value);

    document.querySelector(`span#loc' ${id}`).innerHTML = '';

    const regex = new RegExp(`<span id="loc'${id}">`, 'g');
    this.mergeString = this.mergeString.replace(regex,`<span id="loc${id}">${value}`);
  }

  diff_prettyPlain = (diffs:any) =>
  {

    const DIFF_DELETE = -1;
    const DIFF_EQUAL = 0;

    const html = [];
    for (let x = 0; x < diffs.length; x++) {
      const op = diffs[x][0];    // Operation (insert, delete, equal)
      const data = diffs[x][1];  // Text of change.
      const text = data;
      switch (op) {
        case DIFF_DELETE:{
          const encodedText = encodeURI(text);
          const obj = {id: x, loc:'left', value:encodedText};
          html[x] = `<button id="${x}" test=${JSON.stringify(obj)} class="diffAdded"><ins>${text}</ins></button>`;
          break;
        }
        case DIFF_EQUAL:{
          html[x] = `<span>${text}</span>`;
          break;
        }
      }
    }
    return html.join('');

  };

  diff_into_prettyPlain = (diffs:any) =>
  {

    const DIFF_DELETE = -1;
    const DIFF_EQUAL = 0;

    const html = [];
    for (let x = 0; x < diffs.length; x++) {
      const op = diffs[x][0];    // Operation (insert, delete, equal)
      const data = diffs[x][1];  // Text of change.
      const text = data;
      switch (op) {
        case DIFF_DELETE:
           html[x] = `<span id="loc${x}"></span>`;
          break;
        case DIFF_EQUAL:
          html[x] = `<span>${text}</span>`;
          break;
      }
    }
    return html.join('');

  };

  diff_lineMode(text1, text2) {
    const dmp = new DiffMatchPatch();
    const a = this.diff_linesToChars_(text1, text2);
    const lineText1 = a.chars1;
    const lineText2 = a.chars2;
    const lineArray = a.lineArray;
    const diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return diffs;
  }

  diff_linesToChars_ = (text1, text2) => {
    const lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
    const lineHash = {};   // e.g. lineHash['Hello\n'] == 4

    // '\x00' is a valid character, but various debuggers don't like it.
    // So we'll insert a junk entry to avoid generating a null character.
    lineArray[0] = '';

    /**
     * Split a text into an array of strings.  Reduce the texts to a string of
     * hashes where each Unicode character represents one line.
     * Modifies linearray and linehash through being a closure.
     *
     * @param {string} text String to encode.
     * @return {string} Encoded string.
     * @private
     */

    // Allocate 2/3rds of the space for text1, the rest for text2.
    let maxLines = 40000;
    const chars1 = this.diff_linesToCharsMunge(text1, lineArray, lineHash, maxLines);
    maxLines = 65535;
    const chars2 = this.diff_linesToCharsMunge(text2, lineArray, lineHash, maxLines);
    return {chars1, chars2, lineArray};
  };

  diff_linesToCharsMunge = (text, lineArray, lineHash, maxLines) => {
    let chars = '';
    // Walk the text, pulling out a substring for each line.
    // text.split('\n') would would temporarily double our memory footprint.
    // Modifying text would create many large strings to garbage collect.
    let lineStart = 0;
    let lineEnd = -1;
    // Keeping our own length variable is faster than looking it up.
    let lineArrayLength = lineArray.length;
    while (lineEnd < text.length - 1) {
      lineEnd = text.indexOf(' ', lineStart);
      if (lineEnd === -1) {
        lineEnd = text.length - 1;
      }
      let line = text.substring(lineStart, lineEnd + 1);

      if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
          (lineHash[line] !== undefined)) {
        chars += String.fromCharCode(lineHash[line]);
      } else {
        if (lineArrayLength === maxLines) {
          // Bail out at 65535 because
          // String.fromCharCode(65536) == String.fromCharCode(0)
          line = text.substring(lineStart);
          lineEnd = text.length;
        }
        chars += String.fromCharCode(lineArrayLength);
        lineHash[line] = lineArrayLength;
        lineArray[lineArrayLength++] = line;
      }
      lineStart = lineEnd + 1;
    }
    return chars;
  };
}
