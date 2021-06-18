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
import { Title } from '@angular/platform-browser';
import { SubscribedCatalogue } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-subscribed-catalogue-detail',
  templateUrl: './subscribed-catalogue-detail.component.html',
  styleUrls: ['./subscribed-catalogue-detail.component.scss']
})
export class SubscribedCatalogueDetailComponent implements OnInit {

  @Input() subscribedCatalogue: SubscribedCatalogue;


  processing = false;

  constructor(
    private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle(`Subscribed Catalogue - ${this.subscribedCatalogue.label}`);
  }
}
