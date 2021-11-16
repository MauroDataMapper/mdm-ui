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

import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CatalogueItemDomainType, TermDetail, TerminologyDetail, TermRelationship, TermRelationshipType } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BehaviorSubject } from 'rxjs';
import { CreateTermRelationshipDialogComponent } from '../create-term-relationship-dialog/create-term-relationship-dialog.component';

class CreateTermRelationshipForm {
  targetTerm: TermDetail;
  relationshipType: TermRelationshipType;

  constructor(readonly terminology: TerminologyDetail, readonly sourceTerm: TermDetail) {}
}

@Component({
  selector: 'mdm-term-relationship-list',
  templateUrl: './term-relationship-list.component.html',
  styleUrls: ['./term-relationship-list.component.scss']
})
export class TermRelationshipListComponent implements OnInit, OnChanges {
  @Input() term: TermDetail;
  @Input() canEdit = false;
  @Input() canDelete = false;
  @Output() selectedTerm = new EventEmitter<TermDetail>();
  @Output() totalCount =  new EventEmitter<number>();
  totalItemCount = 0;
  private _relationships = new BehaviorSubject<TermRelationship[]>([]);
  private _relationshipTypes = new BehaviorSubject<TermRelationshipType[]>([]);

  constructor(private resources: MdmResourcesService, private dialog: MatDialog) {}

  ngOnInit() {
  }

  ngOnChanges(changes) {
    if (changes.term) {
      this.fetchRelationships();
    }
  }

  fetchRelationships() {
    if (this.term) {
      this.resources.term.termRelationships(this.term.terminology.id, this.term.id, {
        sort: 'label',
        order: 'asc'
      }).subscribe(
        data => {
          this.relationships = data.body.items.filter(i => (i.sourceTerm.id === this.term.id) && i.targetTerm.domainType !== CatalogueItemDomainType.Terminology);
          const relationshipTypes = [];
          this.relationships.forEach(r => {
            if (!relationshipTypes.map(rt => rt.id).includes(r.relationshipType.id)) {
              relationshipTypes.push(r.relationshipType);
            }
          });
          this.relationshipTypes = relationshipTypes;
          this.totalItemCount = this.relationships.length;
          this.totalCount.emit(this.totalItemCount);
        },
        error => console.error(error)
      );
    }
  }

  get relationships() {
    return this._relationships.value;
  }

  set relationships(relationships: TermRelationship[]) {
    this._relationships.next(relationships);
  }

  get relationshipTypes() {
    return this._relationshipTypes.value;
  }

  set relationshipTypes(relationshipTypes: TermRelationshipType[]) {
    this._relationshipTypes.next(relationshipTypes);
  }

  filterByRelationshipType(relationshipType: TermRelationshipType) {
    return this.relationships.filter(r => r.relationshipType.id === relationshipType.id);
  }

  deleteRelationship(termRelationship: TermRelationship) {
    this.resources.terms.removeTermRelationship(this.term.terminology.id, termRelationship.sourceTerm.id, termRelationship.id).subscribe(() => {
      this.fetchRelationships();
    });
  }

  openAddRelationshipDialog(): void {
    const dialogRef = this.dialog.open(CreateTermRelationshipDialogComponent, {
      data: new CreateTermRelationshipForm(this.term.terminology, this.term)
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.fetchRelationships();
      }
    });
  }
}