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
import {
  CollectionViewer,
  DataSource,
  SelectionChange
} from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  CatalogueItemDomainType,
  MdmTreeItemListResponse,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ModelTreeService } from '@mdm/services/model-tree.service';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { finalize, map, takeUntil } from 'rxjs/operators';

export const FLAT_TREE_LEVEL_START = 0;

export const isDomainExpandable = (domain: CatalogueItemDomainType) => {
  return (
    domain === CatalogueItemDomainType.Folder ||
    domain === CatalogueItemDomainType.VersionedFolder ||
    domain === CatalogueItemDomainType.DataModel ||
    domain === CatalogueItemDomainType.DataClass ||
    domain === CatalogueItemDomainType.Terminology ||
    domain === CatalogueItemDomainType.Term
  );
};

export interface MauroItemTreeFlatNode {
  id: Uuid;
  domainType: CatalogueItemDomainType;
  label: string;
  level: number;
  expandable: boolean;
  isLoading?: boolean;
  modelId?: Uuid;
  parentId?: Uuid;
  finalised?: boolean;
  branchName?: string;
  modelVersion?: string;
}

export class MauroTreeViewDataSource extends DataSource<MauroItemTreeFlatNode> {
  dataChange = new BehaviorSubject<MauroItemTreeFlatNode[]>([]);

  private unsubscribe$ = new Subject<void>();

  get data(): MauroItemTreeFlatNode[] {
    return this.dataChange.value;
  }
  set data(value: MauroItemTreeFlatNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private treeControl: FlatTreeControl<MauroItemTreeFlatNode>,
    private resources: MdmResourcesService,
    private modelTree: ModelTreeService
  ) {
    super();
  }

  connect(
    collectionViewer: CollectionViewer
  ): Observable<readonly MauroItemTreeFlatNode[]> {
    this.treeControl.expansionModel.changed
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((change) => {
        // "added" collection means a node is about to be expanded
        // "removed" collection means a node is about to be collapsed
        if (change.added || change.removed) {
          this.handleExpandCollapse(change);
        }
      });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data)
    );
  }

  disconnect(_: CollectionViewer): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  handleExpandCollapse(change: SelectionChange<MauroItemTreeFlatNode>) {
    if (change.added) {
      change.added.forEach((node) => this.expandNode(node));
    }

    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.collapseNode(node));
    }
  }

  expandNode(node: MauroItemTreeFlatNode) {
    const index = this.data.indexOf(node);
    if (index < 0) {
      return;
    }

    const request$ = this.requestTreeItems(node);

    node.isLoading = true;

    request$
      .pipe(
        map((response) =>
          response.body.map<MauroItemTreeFlatNode>((treeItem) => {
            return {
              ...treeItem,
              label: treeItem.label,
              level: node.level + 1,
              expandable: treeItem.hasChildren ?? false
            };
          })
        ),
        finalize(() => (node.isLoading = false))
      )
      .subscribe((children) => {
        this.data.splice(index + 1, 0, ...children);

        // Notify the change
        this.dataChange.next(this.data);
        node.isLoading = false;
      });
  }

  collapseNode(node: MauroItemTreeFlatNode) {
    const index = this.data.indexOf(node);
    if (index < 0) {
      return;
    }

    node.isLoading = true;

    // Find start/end nodes to remove
    let count = 0;
    for (
      let i = index + 1;
      i < this.data.length && this.data[i].level > node.level;
      i++, count++
    ) {}

    this.data.splice(index + 1, count);

    // Notify the change
    this.dataChange.next(this.data);
    node.isLoading = false;
  }

  private requestTreeItems(
    node: MauroItemTreeFlatNode
  ): Observable<MdmTreeItemListResponse> {
    switch (node.domainType) {
      case CatalogueItemDomainType.Folder:
      case CatalogueItemDomainType.VersionedFolder: {
        // VersionedFolders are treated the same as Folders
        return this.resources.tree.getFolder(node.id);
      }
      case CatalogueItemDomainType.DataModel:
        return this.resources.tree.get('folders', 'dataModels', node.id);
      case CatalogueItemDomainType.DataClass:
        return this.resources.tree.get('folders', 'dataClasses', node.id);
      case CatalogueItemDomainType.Terminology:
        return this.resources.tree.get('folders', 'terminologies', node.id);
      case CatalogueItemDomainType.Term:
        return this.resources.tree.get('folders', 'terms', node.id);
      case CatalogueItemDomainType.SubscribedCatalogue:
        return this.modelTree.getFederatedDataModelNodes(node.id).pipe(
          map((items) => {
            return {
              body: items
            };
          })
        );
      default:
        return of({ body: [] });
    }
  }
}
