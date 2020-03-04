export class DataModelResult {
    id: string;
    domainType:string;
    label: string;
    documentationVersion:any[];
    description: string;
    editable: boolean;
    lastUpdated: string;
    classifiers:Classifiers[];
    type: string;
    finalised: boolean;
    author: string;
    organisation: string;
    dateFinalised: string;
    aliases:any[];
    semanticLinks: any[];
    readableByEveryone: boolean;
    deleted: boolean;
}



export class Classifiers {
    id: string;
    label: string;
    lastUpdated:string;

}


export class EditableDataModel {

    constructor(){}

    deletePending: boolean;
    label:string;
    description: string;
    classifiers:Classifiers[] = [];
    aliases:any[] = [];
    visible: boolean;
    waiting: boolean;
    author: any;
    organisation:any;
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
    category:string;
}