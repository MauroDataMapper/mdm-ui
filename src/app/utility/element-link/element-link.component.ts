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
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { getCatalogueItemDomainTypeIcon } from '@mdm/folders-tree/flat-node';
import { ElementTypesService } from '@mdm/services/element-types.service';

@Component({
  selector: 'mdm-element-link',
  templateUrl: './element-link.component.html',
})
export class ElementLinkComponent implements OnInit {
  @Input() hideVersionNumber: boolean;
  @Input() justShowCodeForTerm: boolean;
  @Input() showTypeTitle: boolean;
  @Input() showTypeIcon = false;
  @Input() newWindow: boolean;
  @Input() parentDataModel: any;
  @Input() parentDataClass: any;
  @Input() showHref = true;
  @Input() showParentDataModelName: boolean;
  @Input() showLink = true;
  @Output() selectedElementsChange = new EventEmitter<any[]>();
  elementVal: any;

  linkUrl: string;

  @Input()
  get element() {
    return this.elementVal;
  }

  set element(val) {
    this.elementVal = val;
    this.selectedElementsChange.emit(this.elementVal);
    this.ngOnInit();
  }

  label: string;
  versionNumber: string;
  openLinkLocation: string;
  elementTypeTitle: string;
  types: any[];

  replaceLabelBy: any;
  disableLink: any;

  constructor(private elementTypes: ElementTypesService) {}

  ngOnInit() {
    this.label = '';
    this.versionNumber = '';

    this.linkUrl = this.elementTypes.getLinkUrl(this.element);

    if (!this.hideVersionNumber) {
      this.versionNumber = this.element?.documentationVersion ? `Documentation Version: ${this.element.documentationVersion}` : '';
    }

    this.label = this.element?.label || this.element?.definition;
    if (this.element?.domainType === 'Term' && !this.justShowCodeForTerm) {
      this.label = `${this.element.label}`;
    }
    if (this.element?.domainType === 'Term' && this.justShowCodeForTerm) {
      this.label = this.element.label;
    }

    if (this.replaceLabelBy) {
      this.label = this.replaceLabelBy;
    }

    if (this.showParentDataModelName && this.element?.domainType !== 'DataModel' && this.element?.domainType !== 'Term' && this.element?.domainType !== 'Terminology') {
      const parentDM = this.element?.breadcrumbs && this.element?.breadcrumbs.length > 0 ? this.element?.breadcrumbs[0] : null;
      this.label = parentDM?.label ? (`${parentDM?.label} : ${this.label}`) : this.label;
      if (this.label === 'undefined : undefined') {
        this.label = '';
      }
    }

    this.initTypeLabel();
    this.initLink();
  }

  public initTypeLabel(): any {
    this.elementTypeTitle = '';
    this.types = this.elementTypes.getTypes();
    if (
      this.element &&
      this.element.domainType &&
      this.types.filter(x => x.id === this.element.domainType)
    ) {
      this.elementTypeTitle = this.types.filter(
        x => x.id === this.element.domainType
      )[0].title;
    }
  }

  public initLink() {
    this.openLinkLocation = '_self';
    if (this.newWindow) {
      this.openLinkLocation = '_blank';
    }
    // if it's true or it's NOT mentioned then make it true
    if (
      this.showLink === true ||
      this.showLink ||
      this.showLink === undefined
    ) {
      this.showLink = true;
    }
  }

  getIcon() {
    return getCatalogueItemDomainTypeIcon(this.element.domainType);
  }

  hasIcon() {
    return getCatalogueItemDomainTypeIcon(this.element.domainType) !== null;
  }
}
