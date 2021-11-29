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
import { QueryParameters, TermDetail } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mdm-term-relationships',
  templateUrl: './term-relationships.component.html',
  styleUrls: ['./term-relationships.component.scss']
})
export class TermRelationshipsComponent implements OnInit {
  @Input() term: TermDetail;
  @Input() type?: string;
  subscription: Subscription;
  totalItems = 0;

  loading = true;
  relationshipTypes = [];
  relations = {};
  constructor(
    private resources: MdmResourcesService,
  ) {
  }

  ngOnInit() {
    if (this.term) {
      const parameters: QueryParameters = { };
      if (this.type) {
        parameters.type = this.type;
      }

      this.resources.term.termRelationships(this.term.terminology.id, this.term.id, parameters)
        .subscribe(data => {
          this.totalItems = data.body.count;
          data.body.items.forEach(item => {
            if (!this.relations[item.relationshipType.displayLabel]) {
              this.relationshipTypes.push(item.relationshipType.displayLabel);
              this.relations[item.relationshipType.displayLabel] = [];
            }
            this.relations[item.relationshipType.displayLabel].push(item);
          });
          this.loading = false;
        }, () => {
          this.loading = false;
        });
    }
  }
}
