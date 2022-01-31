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
import { SharedService } from '../services/shared.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass']
})
export class AboutComponent implements OnInit {

  public appVersion: string;
  constructor(private shared: SharedService, private title: Title) { }

  ngOnInit() {
    this.appVersion = this.shared.appVersion;
    this.title.setTitle('About');
  }
}
