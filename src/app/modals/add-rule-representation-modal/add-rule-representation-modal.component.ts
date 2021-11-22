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

export class RuleLanguages {
  static supportedLanguages = [
    { displayName: 'SQL', value: 'sql', aceValue: 'sql', fileExt: 'sql' },
    { displayName: 'C#', value: 'c#', aceValue: 'csharp', fileExt: 'cs' },
    {
      displayName: 'JavaScript',
      value: 'javascript',
      aceValue: 'javascript',
      fileExt: 'js'
    },

    { displayName: 'Java', value: 'java', aceValue: 'java', fileExt: 'java' },
    {
      displayName: 'Typescript',
      value: 'typescript',
      aceValue: 'typescript',
      fileExt: 'ts'
    },
    {
      displayName: 'Drools',
      value: 'drools',
      aceValue: 'drools',
      fileExt: 'drools'
    },
    { displayName: 'Text', value: 'text', aceValue: 'text', fileExt: 'txt' },
    { displayName: 'DMN', value: 'dmn', aceValue: '', fileExt: 'dmn' }
  ];
}

import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import DmnModeler from 'dmn-js/lib/Modeler';

import 'brace';
import 'brace/mode/drools';
import 'brace/mode/sql';
import 'brace/mode/java';
import 'brace/mode/javascript';
import 'brace/mode/typescript';
import 'brace/mode/csharp';
import 'brace/mode/text';
import 'brace/theme/github';
import { MessageHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-add-rule-representation-modal',
  templateUrl: './add-rule-representation-modal.component.html',
  styleUrls: ['./add-rule-representation-modal.component.scss']
})
export class AddRuleRepresentationModalComponent implements OnInit {
  @ViewChild('dmn') set content(content: ElementRef) {
    if (content) {
      // initially setter gets called with undefined
      this.dmnCanvas = content;
      this.createDMNWindow();
    }
  }

  dmnCanvas: ElementRef;

  initialDiagram =
    '<?xml version="1.0" encoding="UTF-8"?>\n<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="REQUIRED" name="definitions" namespace="http://camunda.org/schema/1.0/dmn">\n  <decision id="decision_{{ ID }}" name="">\n    <decisionTable id="decisionTable_{{ ID }}">\n      <input id="input1" label="">\n        <inputExpression id="inputExpression1" typeRef="string">\n          <text></text>\n        </inputExpression>\n      </input>\n      <output id="output1" label="" name="" typeRef="string" />\n    </decisionTable>\n  </decision>\n</definitions>';
  okBtn: string;
  cancelBtn: string;
  btnType: string;
  inputValue: { label: string; groups: any[] };
  modalTitle: string;
  message: string;
  inputLabel: string;
  allGroups = [];
  selectedGroups = [];
  modeler: DmnModeler;
  supportedLanguage = RuleLanguages.supportedLanguages;
  selectedLanguage = this.supportedLanguage[0];
  myFilename = 'Import File';
  options:any = { showPrintMargin  : false};

  constructor(
    private dialogRef: MatDialogRef<AddRuleRepresentationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnInit(): void {
    this.okBtn = this.data.okBtn ? this.data.okBtn : 'Save';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelBtn = this.data.cancelBtn ? this.data.cancelBtn : 'Cancel';
    this.inputLabel = this.data.inputLabel ? this.data.inputLabel : '';
    this.modalTitle = this.data.modalTitle ? this.data.modalTitle : '';
    this.message = this.data.message;

    this.inputValue = {
      label: '',
      groups: []
    };

    this.supportedLanguage.forEach((x) => {
      if (x.value === this.data.language) {
        this.selectedLanguage = x;
      }
    });

    if (this.data.language === 'dmn') {
      this.createDMNWindow();
    }
  }

  showAceEditor() {
    return this.selectedLanguage.aceValue.length > 0;
  }

  createDMNWindow(content?: any) {
    setTimeout(() => {
      if (!this.modeler) {
        this.modeler = new DmnModeler({
          container: '#dmn',
          width: '600px',
          height: '600px'
        });
      }

      let xml = content;

      if (!xml) {
        xml =
          this.data.language === 'dmn' && this.data.representation.length > 0
            ? this.data.representation
            : this.initialDiagram;
      }
      const { migrateDiagram } = require('@bpmn-io/dmn-migrate');
      migrateDiagram(xml).then((migratedXML) => {
        this.modeler.importXML(migratedXML, (err) => {
          if (err) {
            this.messageHandler.showError(err);
            this.createDMNWindow(this.data.representation);
          } else {
            const activeEditor = this.modeler.getActiveViewer();
            const canvas = activeEditor.get('canvas');
            canvas.zoom('fit-viewport');
          }
        });
      });
    }, 1000);
  }

  otherFileAdded(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.myFilename = fileInput.target.files[0].name;
      const lang = this.supportedLanguage.find(
        (x) => x.fileExt === this.myFilename.split('.')[1]
      );

      if (lang) {
        this.selectedLanguage = lang;
        const reader = new FileReader();
        reader.onload = () => {
          if(lang.value === 'dmn')
          {
            this.createDMNWindow(reader.result);
          }
          else{
          this.data.representation = reader.result;
          }
        };
        reader.readAsText(fileInput.target.files[0]);
      }
      else{
        this.myFilename = 'Import File';
        this.messageHandler.showError('Unable in import file please copy and paste');
      }
    }
  }

  save() {
    this.data.language = this.selectedLanguage.value;
    if (this.data.language === 'dmn') {
      this.modeler.saveXML({ format: true }, (err, xml) => {
        if (err) {
          return;
        }
        this.data.representation = xml;
      });
    }
    this.dialogRef.close(this.data);
  }
}
