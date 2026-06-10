/*
Copyright 2020-2026 University of Oxford and NHS England

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
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { CatalogueItemDomainType, MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { PathNameService } from '../path-name/path-name.service';
import { getCatalogueItemDomainTypeIcon } from '@mdm/folders-tree/flat-node';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { PathElementType, pathElementDomainTypes } from '../path-name/path-name.model';

interface LocationPathItem {
  label: string
  href?: string
  branchName?: string
  modelVersion?: string
  modelVersionTag?: string
  versionOrBranch?: string
  propertyName?: string
  typeName?: string
  domainType?: string
  icon?: string
}

@Component({
    selector: 'mdm-location-path',
    templateUrl: './location-path.component.html',
    styleUrls: ['./location-path.component.scss'],
    standalone: true,
    imports: [MatTooltip, NgIf, NgFor, MatIcon, NgClass, ExtendedModule]
})
export class LocationPathComponent implements OnInit, OnChanges {
  @Input() ancestorTreeItems: MdmTreeItem[] = [];
  @Input() path?: string;
  @Input() compact = false;
  @Input() skipFirst = false;

  items: LocationPathItem[] = [];
  loading = true;
  private readonly pathTypeDomainMap = new Map<PathElementType, CatalogueItemDomainType>(
    Array.from(pathElementDomainTypes.entries()).map(([domainType, pathType]) => [pathType, domainType])
  );

  constructor(private pathName: PathNameService) {}

  ngOnInit(): void {
    this.rebuildItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ancestorTreeItems || changes.path) {
      this.rebuildItems();
    }
  }

  private rebuildItems() {
    this.loading = true;

    if (this.path?.trim()) {
      this.items = this.buildItemsFromPath(this.path);
      this.loading = false;
      return;
    }

    this.items = this.ancestorTreeItems?.map((ancestor) => {
      return {
        label: ancestor.label,
        href: this.pathName.createHref(ancestor.path, ancestor),
        branchName: ancestor.branchName,
        modelVersion: ancestor.modelVersion,
        modelVersionTag: ancestor.modelVersionTag,
        domainType: ancestor.domainType,
        icon: ancestor.domainType ? getCatalogueItemDomainTypeIcon(ancestor.domainType) : null
      };
    }) ?? [];

    this.loading = false;
  }

  private buildItemsFromPath(path: string): LocationPathItem[] {
    try {
      const pathElements = this.pathName.parse(path) ?? [];
      const itemsToRender = this.skipFirst && pathElements.length > 1
        ? pathElements.slice(1)
        : pathElements;

      return itemsToRender.map((pathElement) => ({
        label: pathElement.label,
        versionOrBranch: pathElement.version,
        propertyName: pathElement.property?.qualifiedName?.join('.'),
        typeName: pathElement.typeName,
        icon: this.getIconFromPathElementType(pathElement.type)
      }));
    } catch {
      return [];
    }
  }

  private getIconFromPathElementType(type: PathElementType): string {
    const domainType = this.pathTypeDomainMap.get(type);
    return domainType ? getCatalogueItemDomainTypeIcon(domainType) : 'fa-file-alt';
  }
}
