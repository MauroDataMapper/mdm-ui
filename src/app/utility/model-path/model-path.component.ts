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
import { Component, OnInit, Input } from '@angular/core';
import { ElementTypesService } from '@mdm/services/element-types.service';

@
Component({
    selector: 'mdm-model-path',
    templateUrl: './model-path.component.html',
})

export class ModelPathComponent implements OnInit {

    @Input() path: any[];
    @Input() newWindow: boolean;
    @Input() doNotDisplayStatus: boolean;
    @Input() showHref = true;
    @Input() doNotShowParentDataModel: boolean;

    updatedPath: any[];
    targetWindow;

    showAsSimpleText;

    constructor(private elementTypes: ElementTypesService) { }

    ngOnInit() {
        this.updatedPath = [];
        if (this.path) {
        this.path.forEach((p, index) => {
            if(p.domainType === 'ReferenceDataModel') {
                p.link = this.elementTypes.getLinkUrl({ id: p.id, domainType: 'ReferenceDataModel' });
            }
            else if(p.domainType === 'Terminology'){
                p.link = this.elementTypes.getLinkUrl({ id: p.id, domainType: 'Terminology' });
            }
            else {
              if (index === 0) {
                  p.link = this.elementTypes.getLinkUrl({ id: p.id, domainType: 'DataModel' });
              } else if (index === 1) {
                  p.link = this.elementTypes.getLinkUrl({ id: p.id, model: this.path[0].id, domainType: 'DataClass' });
              } else {
                  p.link = this.elementTypes.getLinkUrl({ id: p.id, model: this.path[0].id, parentDataClass: this.path[index - 1].id, domainType: 'DataClass' });
              }
            }
            this.updatedPath.push(p);
        });
        }

        this.targetWindow = '';
        if (this.newWindow) {
            this.targetWindow = '_blank';
        }
    }
}
