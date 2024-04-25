/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { PathNameService } from '../path-name/path-name.service';

interface LocationPathItem {
  label: string;
  href: string;
  branchName?: string;
  modelVersion?: string;
  modelVersionTag?: string;
}

@Component({
  selector: 'mdm-location-path',
  templateUrl: './location-path.component.html',
  styleUrls: ['./location-path.component.scss']
})
export class LocationPathComponent implements OnChanges {
  @Input() ancestorTreeItems: MdmTreeItem[] = [];

  items: LocationPathItem[] = [];

  constructor(private pathName: PathNameService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ancestorTreeItems) {
      this.items =
        this.ancestorTreeItems?.map((ancestor) => {
          return {
            label: ancestor.label,
            href: this.pathName.createHref(ancestor.path),
            branchName: ancestor.branchName,
            modelVersion: ancestor.modelVersion,
            modelVersionTag: ancestor.modelVersionTag
          };
        }) ?? [];
    }
  }
}
