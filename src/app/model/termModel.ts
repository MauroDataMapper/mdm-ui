export class TermResult {
    terminology: any;
    terminologyLabel: string;
    code: string;
    definition: string;
    id: string;
    domainType: string;
    url: string;
    dateCreated: string;
    label: string;
    description: string;
    editable: boolean;
    lastUpdated: string;
    classifiers: Classifiers[];
    type: string;
    finalised: boolean;
    author: string;
    organisation: string;
    dateFinalised: string;
    aliases: any[];
    semanticLinks: any[];
    deleted = false;
    readableByEveryone: boolean;

}



export class Classifiers {
    id: string;
    label: string;
    lastUpdated: string;

}


export class EditableTerm {

    constructor() {}
    id: string;
    terminology: string;
    terminologyLabel: string;
    code: string;
    definition: string;
    label: string;
    description: string;
    url: string;
    dateCreated: string;
    domainType: string;
    editable: boolean;
    deletePending: boolean;
    classifiers: Classifiers[] = [];
    aliases: any[] = [];
    finalised: boolean;
    visible: boolean;
    waiting: boolean;
    validationError: boolean;



    show() {

    }
    cancel() {

    }
    save(parent: any) {

    }

}

export class Categories {
    index: number;
    id: string;
    key: string;
    value: string;
    category: string;
}
