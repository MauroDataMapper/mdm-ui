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
import { AfterViewInit } from '@angular/core';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { diff_match_patch } from 'diff-match-patch';

@Component({
  selector: 'mdm-text-diff',
  templateUrl: './text-diff.component.html',
  styleUrls: ['./text-diff.component.scss']
})
export class TextDiffComponent implements AfterViewInit {
  @Input() left : any;
  @Input() right : any;

  // This is new
  @ViewChild('diff', { static: false }) set diffCon(content: ElementRef) {
    this.diff = content;
  }

  diff: ElementRef;
  mergeString: any;
  mergeDiffrl: any;
  mergeDifflr: any;

  constructor() {}

  ngAfterViewInit(): void {
    if (this.right && this.left) {
      const diffrl = this.diffLineMode(this.right.toString(), this.left.toString());
      this.diff.nativeElement.innerHTML = this.diffPrettyPlain(diffrl);
    }
  }

  diffPrettyPlain = (diffs: any) => {
    const diffAdded = 1;
    const diffEqual = 0;
    const diffDelete = -1;

    const html = [];
    for (let x = 0; x < diffs.length; x++) {
      const op = diffs[x][0]; // Operation (insert, delete, equal)
      const data = diffs[x][1]; // Text of change.
      const text = data;
      switch (op) {
        case diffAdded: {
          html[x] = `<div class="diffAdded" >${text}</div>`;
          break;
        }
        case diffEqual: {
          html[x] = `<div>${text}</div>`;
          break;
        }
        case diffDelete: {
          html[x] = `<div class="diffDeleted">${text}</div>`;
          break;
        }
      }
    }
    return html.join('');
  };


  diffLineMode(text1, text2) {
    const dmp = new diff_match_patch();
    const a = this.diffLinesToChars(text1, text2);
    const lineText1 = a.chars1;
    const lineText2 = a.chars2;
    const lineArray = a.lineArray;
    const diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return diffs;
  }


  diffLinesToChars = (text1, text2) => {
    const lineArray = []; // e.g. lineArray[4] == 'Hello\n'
    const lineHash = {}; // e.g. lineHash['Hello\n'] == 4

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
    const chars1 = this.diffLinesToCharsMunge(
      text1,
      lineArray,
      lineHash,
      maxLines
    );
    maxLines = 65535;
    const chars2 = this.diffLinesToCharsMunge(
      text2,
      lineArray,
      lineHash,
      maxLines
    );
    return { chars1, chars2, lineArray };
  };

  diffLinesToCharsMunge = (text, lineArray, lineHash, maxLines) => {
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

      if (
        lineHash.hasOwnProperty
          ? lineHash.hasOwnProperty(line)
          : lineHash[line] !== undefined
      ) {
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
