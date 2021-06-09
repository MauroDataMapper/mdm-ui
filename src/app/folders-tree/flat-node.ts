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
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';

/** (Partial) Structure of source node */
export interface Node {
    children?: Node[];
    created?: boolean;
    deleted?: boolean;
    selected?: boolean;
    modified?: boolean;
    finalised?: boolean;
    domainType: DOMAIN_TYPE;
    type?: string;
    hasChildren: boolean;
    id: string;
    label?: string;
    parentFolder?: string;
    code?: string;
    hasChildFolders?: boolean;
    checked?: boolean;
    isRoot?: boolean;
    superseded?: boolean;
    documentationVersion?: string;
    branchName?: string;
    modelVersion?: string;
    modelId?: string;
    parentId?: string;
}

/** Wrapper for source node to support Material Flat Tree */
export class FlatNode {
  disableChecked: boolean;

    constructor(public node: Node, public level: number) {}

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

    get children()  {
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

    get created() {
        return this.node?.created;
    }
    set created(c: boolean) {
        this.node.created = c;
    }

    get deleted() {
        return this.node?.deleted;
    }
    set deleted(d: boolean) {
        this.node.deleted = d;
    }

    get selected() {
        return this.node?.selected;
    }
    set selected(s: boolean) {
        this.node.selected = s;
    }

    get modified() {
        return this.node?.modified;
    }
    set modified(m: boolean) {
        this.node.modified = m;
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

// eslint-disable-next-line no-shadow
export enum DOMAIN_TYPE {
    Folder = 'Folder',
    VersionedFolder = 'VersionedFolder',
    DataModel = 'DataModel',
    DataClass = 'DataClass',
    DataElement = 'DataElement',
    Terminology = 'Terminology',
    Term = 'Term',
    CodeSet = 'CodeSet',
    Classification = 'Classification',
    ReferenceDataModel = 'ReferenceDataModel',
    EnumerationType = 'EnumerationType',

    // TODO: UI only domains for prototyping, consider making them part of backend
    Root = 'Root',
    LocalCatalogue = 'LocalCatalogue',
    ExternalCatalogues = 'ExternalCatalogues',
    SubscribedCatalogue = 'SubscribedCatalogue',
    FederatedDataModel = 'FederatedDataModel'
}

const catalogueItemDomainTypeToDomainType = new Map<CatalogueItemDomainType, DOMAIN_TYPE>([
    [CatalogueItemDomainType.CodeSetType, DOMAIN_TYPE.CodeSet],
    [CatalogueItemDomainType.DataClass, DOMAIN_TYPE.DataClass],
    [CatalogueItemDomainType.DataElement, DOMAIN_TYPE.DataElement],
    [CatalogueItemDomainType.DataModel, DOMAIN_TYPE.DataModel],
    [CatalogueItemDomainType.EnumerationType, DOMAIN_TYPE.EnumerationType],
    [CatalogueItemDomainType.Folder, DOMAIN_TYPE.Folder],
    [CatalogueItemDomainType.VersionedFolder, DOMAIN_TYPE.VersionedFolder],
    [CatalogueItemDomainType.ReferenceDataModel, DOMAIN_TYPE.ReferenceDataModel],
    [CatalogueItemDomainType.Term, DOMAIN_TYPE.Term],
    [CatalogueItemDomainType.Terminology, DOMAIN_TYPE.Terminology]
]);

export const convertCatalogueItemDomainType = (source: CatalogueItemDomainType): DOMAIN_TYPE => catalogueItemDomainTypeToDomainType.get(source);

type FlatNodeIconCallback = (fnode: FlatNode, treeControl: FlatTreeControl<FlatNode>) => string;

const domainTypeIcons = new Map<DOMAIN_TYPE, FlatNodeIconCallback>([
    [DOMAIN_TYPE.Folder, (fnode, treeControl) => treeControl?.isExpanded(fnode) ? 'fa-folder-open' : 'fa-folder'],
    [DOMAIN_TYPE.VersionedFolder, (fnode, treeControl) => treeControl?.isExpanded(fnode) ? 'fa-box-open' : 'fa-box'],
    [DOMAIN_TYPE.DataModel, (fnode, _) => fnode?.type === 'Data Standard' ? 'fa-file-alt' : 'fa-database'],
    [DOMAIN_TYPE.Terminology, () => 'fa-book'],
    [DOMAIN_TYPE.CodeSet, () => 'fa-list'],
    [DOMAIN_TYPE.Classification, () => 'fa-tags'],
    // [DOMAIN_TYPE.Term, () => 'fa-code'],
    [DOMAIN_TYPE.ReferenceDataModel, () => 'fa-file-contract'],
    [DOMAIN_TYPE.LocalCatalogue, () => 'fa-desktop'],
    [DOMAIN_TYPE.ExternalCatalogues, () => 'fa-network-wired'],
    [DOMAIN_TYPE.SubscribedCatalogue, () => 'fa-rss'],
    [DOMAIN_TYPE.FederatedDataModel, () => 'fa-external-link-alt']
 ]);

 export const getDomainTypeIcon = (type: DOMAIN_TYPE, fnode?: FlatNode, treeControl?: FlatTreeControl<FlatNode>) => {
    if (!domainTypeIcons.has(type)) {
        return null;
     }

     return domainTypeIcons.get(type)(fnode, treeControl);
 };
