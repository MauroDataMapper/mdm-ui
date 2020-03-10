/** (Partial) Structure of source node */
export interface Node {
    children?: Node[];
    deleted?: boolean;
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
}

/** Wrapper for source node to support Material Flat Tree */
export class FlatNode {
    constructor(public node: Node, public level: number) {}

    /**
     * Getter and Setter passthrough to source node.
     */
    get id() {
        return this.node.id;
    }

    get label() {
        return this.node.label;
    }

    get children()  {
        return this.node.children;
    }
    set children(nodes) {
        this.node.children = nodes;
    }

    get checked() {
        return this.node.checked;
    }
    set checked(c: boolean) {
        this.node.checked = c;
    }

    get disableChecked() {
        return this.node.disableChecked;
    }
    set disableChecked(dc: boolean) {
        this.node.disableChecked = dc;
    }

    get type() {
        return this.node.type;
    }

    get terminology() {
        return this.node.terminology;
    }

    get parentDataClass() {
        return this.node.parentDataClass;
    }

    get dataModel() {
        return this.node.dataModel;
    }

    get deleted() {
        return this.node.deleted;
    }
    set deleted(d: boolean) {
        this.node.deleted = d;
    }

    get finalised() {
        return this.node.finalised;
    }
    set finalised(d: boolean) {
        this.node.finalised = d;
    }

    get domainType() {
        return this.node.domainType;
    }

    get hasChildren() {
        return this.node.hasChildren;
    }

    get hasChildFolders() {
        return this.node.hasChildFolders;
    }

    get parentFolder() {
        return this.node.parentFolder;
    }

    get isRoot() {
        return this.node.isRoot;
    }

    get code() {
        return this.node.code;
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