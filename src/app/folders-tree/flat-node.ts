/*
Copyright 2020 University of Oxford

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
/** (Partial) Structure of source node */
export interface Node {
    children?: Node[];
    created?: boolean;
    deleted?: boolean;
    selected?: boolean;
    isGhost?: boolean;
    modified?: boolean;
    finalised?: boolean;
    domainType: DOMAIN_TYPE;
    type?: string;
    terminology?: any;
    term?: any;
    hasChildren: boolean;
    id: string;
    label?: string;
    open?: boolean;
    parentFolder?: string;
    disableChecked?: boolean;
    code?: string;
    hasChildFolders?: boolean;
    checked?: boolean;
    parentDataClass?: Node;
    dataModel?: any;
    isRoot?: boolean;
    superseded?: boolean;
    documentationVersion?: string;
    branchName?: string;
}

/** Wrapper for source node to support Material Flat Tree */
export class FlatNode {
    constructor(public node: Node, public level: number) {}

    /**
     * Getter and Setter passthrough to source node.
     */
    get id() {
        return this.node?.id;
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

    get disableChecked() {
        return this.node?.disableChecked;
    }
    set disableChecked(dc: boolean) {
        this.node.disableChecked = dc;
    }

    get type() {
        return this.node?.type;
    }

    get terminology() {
        return this.node?.terminology;
    }

    get parentDataClass() {
        return this.node?.parentDataClass;
    }

    get dataModel() {
        return this.node?.dataModel;
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

    get isGhost() {
        return this.node?.isGhost;
    }
    set isGhost(ig: boolean) {
        this.node.isGhost = ig;
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

}

export enum DOMAIN_TYPE {
    Folder = 'Folder',
    DataModel = 'DataModel',
    DataClass = 'DataClass',
    DataElement = 'DataClass',
    Terminology = 'Terminology',
    Term = 'Term',
    CodeSet = 'CodeSet',
    Classification = 'Classification'
}
