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

import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InputModalComponent } from '../input-modal/input-modal.component';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService } from '@mdm/services/grid.service';
import { MessageHandlerService } from '@mdm/services/utility/message-handler.service';
import DiffMatchPatch from 'diff-match-patch';

@Component({
  selector: 'mdm-resolve-merge-conflict-modal',
  templateUrl: './resolve-merge-conflict-modal.component.html',
  styleUrls: ['./resolve-merge-conflict-modal.component.scss']
})
export class ResolveMergeConflictModalComponent implements AfterViewInit {

  private mergeViewrl : ElementRef;
  private mergeViewlr : ElementRef;

  @ViewChild("mergeDiffrl", {static:false}) set mergeDiffConRl(content: ElementRef) {
    this.mergeViewrl = content
  }

  @ViewChild("mergeDifflr", {static:false}) set mergeDiffConLR(content: ElementRef) {
    this.mergeViewlr = content
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
    this.data.mergeString = this.mergeString
    this.dialogRef.close({ status: 'ok' ,  data : this.data });
  }

  onMergeConflictPress(thing:any)
  {
    const item = thing.currentTarget;
    const obj = JSON.parse(item.attributes.test.value);
    const id = obj.id;
    const value = decodeURI(obj.value);

    document.querySelector('span#loc'+id).innerHTML = "";
    
    var regex = new RegExp("<span id=\"loc" +  id +"\">", "g");
    this.mergeString = this.mergeString.replace(regex,'<span id="loc'+id+'">' + value + ' ');
  }
  
  diff_prettyPlain = (diffs:any) =>
  {

    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;

    var html = [];
    for (var x = 0; x < diffs.length; x++) {
      var op = diffs[x][0];    // Operation (insert, delete, equal)
      var data = diffs[x][1];  // Text of change.
      var text = data;
      switch (op) {
        case DIFF_INSERT:
        //  html[x] = '<ins class="diffAdded">' + text + '</ins>';
          break;
        case DIFF_DELETE:
          const encodedText = encodeURI(text);
          let obj = {id: x, loc:"left", value:encodedText};

          html[x] = '<button id="'+x+'" test='+ JSON.stringify(obj)+' class="diffAdded"><ins>' + text + '</ins></button>';
          break;
        case DIFF_EQUAL:
          html[x] = '<span>' + text + '</span>';
          break;
      }
    }
    return html.join('');

  }

  diff_into_prettyPlain = (diffs:any) =>
  {

    var DIFF_DELETE = -1;
    var DIFF_INSERT = 1;
    var DIFF_EQUAL = 0;

    var html = [];
    for (var x = 0; x < diffs.length; x++) {
      var op = diffs[x][0];    // Operation (insert, delete, equal)
      var data = diffs[x][1];  // Text of change.
      var text = data;
      switch (op) {
        case DIFF_INSERT:
        //  html[x] = '<ins class="diffAdded">' + text + '</ins>';
          break;
        case DIFF_DELETE:
           html[x] = '<span id="loc'+x+'"></span>';
          break;
        case DIFF_EQUAL:
          html[x] = '<span>' + text + '</span>';
          break;
      }
    }
    return html.join('');

  }

  diff_lineMode(text1, text2) {
    var dmp = new DiffMatchPatch();
    var a = this.diff_linesToChars_(text1, text2);
    var lineText1 = a.chars1;
    var lineText2 = a.chars2;
    var lineArray = a.lineArray;
    var diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return diffs;
  }

  diff_linesToChars_ = (text1, text2) => {
    var lineArray = [];  // e.g. lineArray[4] == 'Hello\n'
    var lineHash = {};   // e.g. lineHash['Hello\n'] == 4
  
    // '\x00' is a valid character, but various debuggers don't like it.
    // So we'll insert a junk entry to avoid generating a null character.
    lineArray[0] = '';
  
    /**
     * Split a text into an array of strings.  Reduce the texts to a string of
     * hashes where each Unicode character represents one line.
     * Modifies linearray and linehash through being a closure.
     * @param {string} text String to encode.
     * @return {string} Encoded string.
     * @private
     */
     
    // Allocate 2/3rds of the space for text1, the rest for text2.
    var maxLines = 40000;
    var chars1 = this.diff_linesToCharsMunge(text1, lineArray, lineHash, maxLines);
    maxLines = 65535;
    var chars2 = this.diff_linesToCharsMunge(text2, lineArray, lineHash, maxLines);
    return {chars1: chars1, chars2: chars2, lineArray: lineArray};
  }

  diff_linesToCharsMunge = (text, lineArray, lineHash, maxLines) => {
    var chars = '';
    // Walk the text, pulling out a substring for each line.
    // text.split('\n') would would temporarily double our memory footprint.
    // Modifying text would create many large strings to garbage collect.
    var lineStart = 0;
    var lineEnd = -1;
    // Keeping our own length variable is faster than looking it up.
    var lineArrayLength = lineArray.length;
    while (lineEnd < text.length - 1) {
      lineEnd = text.indexOf(' ', lineStart);
      if (lineEnd == -1) {
        lineEnd = text.length - 1;
      }
      var line = text.substring(lineStart, lineEnd + 1);

      if (lineHash.hasOwnProperty ? lineHash.hasOwnProperty(line) :
          (lineHash[line] !== undefined)) {
        chars += String.fromCharCode(lineHash[line]);
      } else {
        if (lineArrayLength == maxLines) {
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
  }
}
