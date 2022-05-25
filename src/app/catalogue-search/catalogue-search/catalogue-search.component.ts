/*
Copyright 2020-2022 University of Oxford
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
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

/**
 * Top-level component that represents the overall Catalogue Search page.
 *
 * This acts as the landing page to the catalogue search, holding just the form for
 * entering search criteria.
 */
@Component({
  selector: 'mdm-catalogue-search',
  templateUrl: './catalogue-search.component.html',
  styleUrls: ['./catalogue-search.component.scss']
})
export class CatalogueSearchComponent implements OnInit {
  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Catalogue search');
  }
}
