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
import { BroadcastService } from '@mdm/services/broadcast.service';

@Component({
  selector: 'mdm-comparison-tree',
  templateUrl: './comparison-tree.component.html',
  styleUrls: ['./comparison-tree.component.scss']
})
export class ComparisonTreeComponent implements OnInit {
  @Input() type: any;
  @Input() treeName: any;
  @Input() val: any;
  @Input() parentData: any;
  @Input() childElementName: any;
  @Input() diffMap: any;

  @Input() nodeExpand: any;
  @Input() nodeClick: any;

  constructor(private broadcastSvc: BroadcastService) {}

  ngOnInit() {
    this.broadcastSvc.subscribe(`${this.treeName}-nodeSelected`, data => {
      if (this.val && data.node.id !== this.val.id && this.val.selected) {
        this.val.selected = false;
      }
    });

    if (this.childElementName && this.val && this.val[this.childElementName]) {
      this.val.items = [].concat(this.val[this.childElementName]);
    }

    if (this.val.close !== false) {
      this.val.close = true;
    }
  }

  deleteMe = () => {
    if (this.parentData) {
      const itemIndex = this.parentData.indexOf(this.val);
      this.parentData.splice(itemIndex, 1);
    }
    this.val = {};
  };

  toggleExpand = () => {
    if (this.type === 'dynamic' && this.nodeExpand) {
      this.nodeExpand(this.val).subscribe(data => {
        this.val.items = data;
        this.val.close = !this.val.close;
      });
    } else {
      this.val.close = !this.val.close;
    }
  };

  nodeClickFn = () => {
    this.val.selected = !this.val.selected;
    this.broadcastSvc.broadcast(`${this.treeName}-nodeSelected`, {
      node: this.val
    });
    if (this.nodeClick) {
      this.nodeClick(this.val);
    }
  };
}
