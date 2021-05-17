
/*
Copyright 2020-2021 University of Oxford

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License
*/

import { AfterViewInit, Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mdm-download-link',
  templateUrl: './download-link.component.html',
  styleUrls: ['./download-link.component.scss']
})
export class DownloadLinkComponent implements AfterViewInit {

  @Input() links: Array<HTMLAnchorElement>;
  displayedColumns: string[] = ['link'];
  dataSource = new MatTableDataSource<HTMLAnchorElement>();

  constructor() { }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource<HTMLAnchorElement>(this.links);
  }



}
