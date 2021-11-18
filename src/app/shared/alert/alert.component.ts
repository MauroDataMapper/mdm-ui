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
import { AlertStyle, AlertStyleMetadata } from './alert.model';

@Component({
  selector: 'mdm-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  @Input()
  alertStyle: AlertStyle = 'none';

  @Input()
  showIcon = false;

  private readonly styleMetadata = new Map<AlertStyle, AlertStyleMetadata>([
    ['none', { icon: '', cssModifier: ''}],
    ['success', { icon: 'fa-check-circle', cssModifier: 'mdm-alert--success' }],
    ['info', { icon: 'fa-info-circle', cssModifier: 'mdm-alert--info' }],
    ['warning', { icon: 'fa-exclamation-triangle', cssModifier: 'mdm-alert--warning' }],
    ['error', { icon: 'fa-times-circle', cssModifier: 'mdm-alert--error' }]
  ]);

  constructor() { }

  get iconName() {
    if (!this.showIcon) {
      return '';
    }

    return this.styleMetadata.get(this.alertStyle)?.icon ?? '';
  }

  get cssModifier() {
    return this.styleMetadata.get(this.alertStyle)?.cssModifier ?? '';
  }

  ngOnInit(): void {
  }

}
