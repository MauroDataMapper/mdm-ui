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
import { Component, OnInit } from '@angular/core';
import { SharedService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/angular';

/**
 * Top-level view component for the Merge/Diff user interface.
 *
 * Controls the top-level data to fetch/render, controls for the overall merge operations and
 * child components for rendering the different sections of data.
 */
@Component({
  selector: 'mdm-merge-diff-container',
  templateUrl: './merge-diff-container.component.html',
  styleUrls: ['./merge-diff-container.component.scss']
})
export class MergeDiffContainerComponent implements OnInit {

  loaded = false;
  domainType: string;

  constructor(
    private shared: SharedService,
    private stateHandler: StateHandlerService,
    private uiRouterGlobals: UIRouterGlobals) { }

  ngOnInit(): void {
    if (!this.shared.features.useMergeUiV2) {
      // Feature toggle guard
      this.stateHandler.Go('alldatamodel');
      return;
    }

    const sourceId = this.uiRouterGlobals.params.sourceId;
    const targetId = this.uiRouterGlobals.params.targetId;
    this.domainType = this.uiRouterGlobals.params.catalogueDomainType;


    this.loaded = true;
    // TODO: load UI...
  }

  onCommitChanges(): void{
    // TODO
  }

}
