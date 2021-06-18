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

import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mdm-download-link',
  templateUrl: './download-link.component.html',
  styleUrls: ['./download-link.component.scss']
})
export class DownloadLinkComponent implements OnChanges{

  @Input() links: Array<HTMLAnchorElement>;
  @Output() readonly linksChange = new EventEmitter<Array<HTMLAnchorElement>>();

  displayedColumns: string[] = ['link','delete'];
  dataSource = new MatTableDataSource<HTMLAnchorElement>();

  constructor() { }

  deleteLink(link : HTMLAnchorElement)
  {
    const index = this.dataSource.data.indexOf(link);
    this.dataSource.data.splice(index,1);
    this.dataSource._updateChangeSubscription();
    this.linksChange.emit(this.dataSource.data);
  }

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource<HTMLAnchorElement>(this.links);
  }
}


