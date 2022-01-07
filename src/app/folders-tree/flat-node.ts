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

import { FlatTreeControl } from '@angular/cdk/tree';
import { CatalogueItemDomainType, MdmTreeItem } from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';

/** Wrapper for source node to support Material Flat Tree */
export class FlatNode {
  disableChecked: boolean;

  constructor(
    public node: MdmTreeItem,
    public level: number,
    public readonly access: Access) { }

  /**
   * Getter and Setter passthrough to source node.
   */
  get id() {
    return this.node?.id;
  }

  get modelId() {
    return this.node?.modelId;
  }

  get label() {
    return this.node?.label;
  }

  get children() {
    return this.node?.children;
  }
  set children(nodes) {
    this.node.children = nodes;
  }

  get checked() {
    return this.node?.checked;
  }
  set checked(c: boolean) {
    this.node.checked = c;
  }

  get type() {
    return this.node?.type;
  }

  get deleted() {
    return this.node?.deleted;
  }
  set deleted(d: boolean) {
    this.node.deleted = d;
  }

  get finalised() {
    return this.node?.finalised;
  }
  set finalised(d: boolean) {
    this.node.finalised = d;
  }

  get domainType() {
    return this.node?.domainType;
  }

  get hasChildren() {
    return this.node?.hasChildren;
  }

  get hasChildFolders() {
    return this.node?.hasChildFolders;
  }

  get parentFolder() {
    return this.node?.parentFolder;
  }

  get isRoot() {
    return this.node?.isRoot;
  }

  get code() {
    return this.node?.code;
  }

  get superseded() {
    return this.node?.superseded;
  }

  get documentationVersion() {
    return this.node?.documentationVersion;
  }

  get branchName() {
    return this.node?.branchName;
  }

  get modelVersion() {
    return this.node?.modelVersion;
  }
}

type FlatNodeIconCallback = (fnode: FlatNode, treeControl: FlatTreeControl<FlatNode>) => string;

const domainTypeIcons = new Map<CatalogueItemDomainType, FlatNodeIconCallback>([
  [CatalogueItemDomainType.Folder, (fnode, treeControl) => treeControl?.isExpanded(fnode) ? 'fa-folder-open' : 'fa-folder'],
  [CatalogueItemDomainType.VersionedFolder, (fnode, treeControl) => treeControl?.isExpanded(fnode) ? 'fa-box-open' : 'fa-box'],
  [CatalogueItemDomainType.DataModel, (fnode, _) => fnode?.type === 'Data Standard' ? 'fa-file-alt' : 'fa-database'],
  [CatalogueItemDomainType.Terminology, () => 'fa-book'],
  [CatalogueItemDomainType.CodeSet, () => 'fa-list'],
  [CatalogueItemDomainType.Classifier, () => 'fa-tags'],
  [CatalogueItemDomainType.Term, () => 'fa-bookmark'],
  [CatalogueItemDomainType.ReferenceDataModel, () => 'fa-file-contract'],
  [CatalogueItemDomainType.LocalCatalogue, () => 'fa-desktop'],
  [CatalogueItemDomainType.ExternalCatalogues, () => 'fa-network-wired'],
  [CatalogueItemDomainType.SubscribedCatalogue, () => 'fa-rss'],
  [CatalogueItemDomainType.FederatedDataModel, () => 'fa-external-link-alt'],
  [CatalogueItemDomainType.DataClass, () => 'fa-puzzle-piece'],
  [CatalogueItemDomainType.DataElement, () => 'fa-atom']
]);

export const getCatalogueItemDomainTypeIcon = (domain: CatalogueItemDomainType, fnode?: FlatNode, treeControl?: FlatTreeControl<FlatNode>) => {
  if (!domainTypeIcons.has(domain)) {
    return null;
  }

  return domainTypeIcons.get(domain)(fnode, treeControl);
};
