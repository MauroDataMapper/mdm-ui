/*
Copyright 2020-2023 University of Oxford
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
import 'brace/mode/json';
import 'brace/mode/typescript';
import 'brace/mode/csharp';
import 'brace/mode/text';
import 'brace/theme/github';
import { MessageHandlerService } from '@mdm/services';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';
import { AceConfigInterface } from 'ngx-ace-wrapper';

export class RuleLanguage {
  displayName: string;
  value: string;
  aceValue?: string;
  fileExt?: string;
}

export const supportedLanguages: RuleLanguage[] = [
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
    displayName: 'JSON',
    value: 'json',
    aceValue: 'json',
    fileExt: 'json'
  },
  {
    displayName: 'JSON (MEQL)',
    value: 'json-meql',
    aceValue: 'json',
    fileExt: 'json'
  },
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
  { displayName: 'DMN', value: 'dmn', fileExt: 'dmn' }
];

export interface AddRuleRepresentationModalConfig {
  language: string;
  representation: string;
  title?: string;
  message?: string;
  okBtnTitle?: string;
  cancelBtnTitle?: string;
  cancelShown?: boolean;
  btnType?: string;
}

export interface AddRuleRepresentationModalResult {
  status: ModalDialogStatus;
  language?: string;
  representation?: string;
}

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
  modalTitle: string;
  message: string;
  allGroups = [];
  selectedGroups = [];
  modeler: DmnModeler;
  supportedLanguages = supportedLanguages;
  aceEditorConfig: AceConfigInterface = { showPrintMargin: false };

  formGroup = new FormGroup({
    language: new FormControl('', Validators.required), // eslint-disable-line @typescript-eslint/unbound-method
    representation: new FormControl(''),
    importFileName: new FormControl('')
  });

  get language() {
    return this.formGroup.controls.language;
  }

  get representation() {
    return this.formGroup.controls.representation;
  }

  get importFileName() {
    return this.formGroup.controls.importFileName;
  }

  constructor(
    private dialogRef: MatDialogRef<
      AddRuleRepresentationModalComponent,
      AddRuleRepresentationModalResult
    >,
    @Inject(MAT_DIALOG_DATA) public data: AddRuleRepresentationModalConfig,
    private messageHandler: MessageHandlerService
  ) {}

  ngOnInit(): void {
    this.okBtn = this.data.okBtnTitle ? this.data.okBtnTitle : 'Save';
    this.btnType = this.data.btnType ? this.data.btnType : 'primary';
    this.cancelBtn = this.data.cancelBtnTitle
      ? this.data.cancelBtnTitle
      : 'Cancel';
    this.modalTitle = this.data.title ? this.data.title : '';
    this.message = this.data.message;

    this.supportedLanguages = this.supportedLanguages.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );

    this.language.setValue(this.data.language);
    this.representation.setValue(this.data.representation);

    if (this.data.language === 'dmn') {
      this.createDMNWindow();
    }
  }

  get selectedLanguage() {
    if (!this.language.value) {
      return undefined;
    }

    return this.supportedLanguages.find(
      (lang) => lang.value === this.language.value
    );
  }

  get showAceEditor() {
    return !!this.selectedLanguage?.aceValue;
  }

  createDMNWindow(content?: any) {
    setTimeout(() => {
      if (!this.modeler) {
        this.modeler = new DmnModeler({
          container: '#dmn',
          width: '100%',
          height: '30vh'
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

  otherFileAdded(fileInput: Event) {
    const target = fileInput.target as HTMLInputElement;

    if (target.files && target.files[0]) {
      const file = target.files[0];

      this.importFileName.setValue(file.name);

      const lang = this.supportedLanguages.find(
        (x) => x.fileExt === file.name.split('.')[1]
      );

      if (!lang) {
        this.importFileName.setValue(null);
        this.messageHandler.showError(
          'Unable to import file. Please copy and paste instead.'
        );
        return;
      }

      this.language.setValue(lang.value);

      const reader = new FileReader();
      reader.onload = () => {
        if (lang.value === 'dmn') {
          this.createDMNWindow(reader.result);
        } else {
          this.representation.setValue(reader.result.toString());
        }
      };
      reader.readAsText(file);
    }
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }

  confirm() {
    if (!this.formGroup.valid) {
      return;
    }

    let representation: string = this.representation.value;

    if (this.selectedLanguage.value === 'dmn') {
      this.modeler.saveXML({ format: true }, (err, xml) => {
        if (err) {
          return;
        }

        representation = xml;
      });
    }

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      language: this.language.value,
      representation: representation ?? ''
    });
  }
}
