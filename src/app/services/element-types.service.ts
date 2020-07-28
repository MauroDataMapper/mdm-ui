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
import { Injectable } from '@angular/core';
import { StateHandlerService } from './handlers/state-handler.service';

@Injectable({ providedIn: 'root' })
export class ElementTypesService {

    constructor(private stateHandler: StateHandlerService) { }

    private semanticLinkTypes: any = {
        Refines: { title: 'Refines', editable: true },
        'Does Not Refine': { title: 'Does Not Refine', editable: true },

        'Is From': { title: 'Is From', editable: false },
        'Superseded By': { title: 'Superseded By', editable: false },
        'New Version Of': { title: 'New Version Of', editable: false }
    };

    private allTypes: Type[] = [
        { id: 'Folder', link: 'folder', title: 'Folder', markdown: 'FD', isBase: true },
        { id: 'DataModel', link: 'dataModel', title: 'DataModel', markdown: 'DM', isBase: true, classifiable: true },
        {
            id: 'DataSet',
            link: 'dataModel',
            title: 'DataModel',
            baseTitle: 'DataModel',
            markdown: 'DM',
            classifiable: true
        },
        {
            id: 'Database',
            link: 'dataModel',
            title: 'DataModel',
            baseTitle: 'DataModel',
            markdown: 'DM',
            classifiable: true
        },
        {
            id: 'DataStandard',
            link: 'dataModel',
            title: 'DataModel',
            baseTitle: 'DataModel',
            markdown: 'DM',
            classifiable: true
        },
        {
            id: 'Form',
            link: 'dataModel',
            title: 'DataModel',
            baseTitle: 'DataModel',
            markdown: 'DM',
            classifiable: true
        },
        {
            id: 'Message',
            link: 'dataModel',
            title: 'DataModel',
            baseTitle: 'DataModel',
            markdown: 'DM',
            classifiable: true
        },
        {
            id: 'Report',
            link: 'dataModel',
            title: 'DataModel',
            baseTitle: 'DataModel',
            markdown: 'DM',
            classifiable: true
        },
        {
            id: 'Workflow',
            link: 'dataModel',
            title: 'DataModel',
            baseTitle: 'DataModel',
            markdown: 'DM',
            classifiable: true
        },
        {
            id: 'DataClass',
            link: 'dataClass',
            title: 'DataClass',
            markdown: 'DC',
            baseTitle: 'DataClass',
            isBase: true,
            classifiable: true
        },
        {
            id: 'DataElement',
            link: 'dataElement',
            title: 'DataElement',
            markdown: 'DE',
            baseTitle: 'DataElement',
            isBase: true,
            classifiable: true
        },
        { id: 'DataType', link: 'dataType', title: 'DataType', markdown: 'DT', isBase: true, classifiable: true },
        {
            id: 'EnumerationType',
            link: 'dataType',
            title: 'DataType (Enum)',
            baseTitle: 'DataType',
            markdown: 'DT',
            displayLabel: 'Enumeration',
            classifiable: true
        },
        {
            id: 'PrimitiveType',
            link: 'dataType',
            title: 'DataType (Primitive)',
            baseTitle: 'DataType',
            markdown: 'DT',
            displayLabel: 'Primitive',
            classifiable: true
        },
        {
            id: 'ReferenceType',
            link: 'dataType',
            title: 'DataType (Reference)',
            baseTitle: 'DataType',
            markdown: 'DT',
            displayLabel: 'Reference',
            classifiable: true
        },
        {
            //TODO remove (HIDDEN) once backend is fixed
            id: 'TerminologyType',
            link: 'dataType(HIDDEN)',
            title: 'DataType (Terminology)',
            baseTitle: 'DataType(HIDDEN)',
            markdown: 'DT',
            displayLabel: 'Terminology',
            classifiable: true
        },
        {
            id: 'EnumerationValue',
            link: 'dataType',
            title: 'EnumerationValue',
            baseTitle: 'CatalogueItem',
            markdown: 'EV',
            isBase: true
        },
        {
            id: 'Terminology',
            link: 'terminology',
            title: 'Terminology',
            baseTitle: 'Terminology',
            markdown: 'TG',
            isBase: true
        },
        { id: 'Term', link: 'term', title: 'Term', baseTitle: 'Term', markdown: 'TM', isBase: true },
        { id: 'CodeSet', link: 'codeSet', title: 'CodeSet', baseTitle: 'CodeSet', markdown: 'CT', isBase: true },
        {
            id: 'Classifier',
            link: 'classification',
            title: 'Classifier',
            resourceName: 'classifier',
            markdown: 'CS',
            isBase: true
        },
    ];

    private baseTypes: any = {
        DataModel: {
            id: 'DataModel',
            link: 'dataModel',
            title: 'DataModel',
            resourceName: 'dataModel',
            markdown: 'DM',
            classifiable: true
        },
        DataClass: {
            id: 'DataClass',
            link: 'dataClass',
            title: 'DataClass',
            resourceName: 'dataClass',
            markdown: 'DC',
            classifiable: true
        },
        DataElement: {
            id: 'DataElement',
            link: 'dataElement',
            title: 'DataElement',
            resourceName: 'dataElement',
            markdown: 'DE',
            classifiable: true
        },
        DataType: {
            id: 'DataType',
            link: 'dataType',
            title: 'DataType',
            resourceName: 'dataType',
            markdown: 'DT',
            classifiable: true
        },

        Classifier: {
            id: 'Classifier',
            link: 'classifier',
            title: 'Classifier',
            resourceName: 'classifier',
            markdown: 'CS'
        },

        Terminology: {
            id: 'Terminology',
            link: 'terminology',
            title: 'Terminology',
            resourceName: 'terminology',
            markdown: 'TG',
            classifiable: true
        },
        Term: { id: 'Term', link: 'term', title: 'Term', resourceName: 'term', markdown: 'TM', classifiable: true },
        CodeSet: {
            id: 'CodeSet',
            link: 'codeSet',
            title: 'CodeSet',
            resourceName: 'codeSet',
            markdown: 'CT',
            classifiable: true
        },

        Folder: {
            id: 'Folder',
            link: 'folder',
            title: 'Folder',
            resourceName: 'folder',
            markdown: 'FD',
            classifiable: true
        },

        EnumerationValue: {
            id: 'EnumerationValue',
            link: 'dataType',
            title: 'EnumerationValue',
            baseTitle: 'CatalogueItem',
            markdown: 'EV',
            isBase: true
        },

    };



    private userTypes: any = {
        UserGroup: { id: 'UserGroup', link: 'userGroup', title: 'UserGroup', resourceName: 'userGroup' },
        User: { id: 'User', link: 'user', title: 'User', resourceName: 'user' },
    };

    getSemanticLinkTypes()  {
        return this.semanticLinkTypes;
    }

    getType(type: string) {
        return this.allTypes[type];
    }

    getTypes() {
        return this.allTypes;
    }

    getAllDataTypesArray() {
        const dataTypes = this.allTypes.filter(f => f.baseTitle === 'DataType');
        return dataTypes;
    }

    getAllDataTypesMap() {
        const dataTypes = this.getAllDataTypesArray();
        const dtMap = {};
        dataTypes.forEach((dt) => {
            dtMap[dt.id] = dt;
        });
        return dtMap;
    }

    getTypesForBaseTypeArray(baseType) {
        const array = [];
        for (const property in this.allTypes) {
            if (this.allTypes.hasOwnProperty(property)) {
                if (!this.allTypes[property].isBase && this.allTypes[property].baseTitle.toLowerCase() === baseType.toLowerCase()) {
                    array.push(this.allTypes[property]);
                }
            }
        }
        return array;
    }

    getBaseTypesAsArray() {
        const array = [];
        for (const property in this.baseTypes) {
            if (this.baseTypes.hasOwnProperty(property)) {
                array.push(this.baseTypes[property]);
            }
        }
        return array;
    }

    getBaseWithUserTypes() {
        const array = [
          ...Object.keys(this.baseTypes).map(p => this.baseTypes[p]),
          ...Object.keys(this.userTypes).map(p => this.userTypes[p])
        ];
        return array;
    }

    getBaseTypes = function() {
        return this.baseTypes;
    };

    getLinkUrl(element, mode?) {
        if (!element || !element.id) {
            return '';
        }

        const types = this.getTypes();
        let parentDataModel = null;
        let parentDataClass = null;
        if (element.dataModel) {
            parentDataModel = element.dataModel;
        } else if (element.breadcrumbs) {
            parentDataModel = element.breadcrumbs[0].id;
        }

        if (element.domainType === 'DataClass') {
            if (element.parentDataClass) {
                parentDataClass = element.parentDataClass;
            } else if (element.breadcrumbs && element.breadcrumbs.length >= 2) {
                parentDataClass = element.breadcrumbs[element.breadcrumbs.length - 1].id;
            }
        }


        if (element.domainType === 'DataElement') {
            if (element.dataClass) {
                parentDataClass = element.dataClass;
            } else if (element.breadcrumbs) {
                parentDataClass = element.breadcrumbs[element.breadcrumbs.length - 1].id;
            }
        }


        if (element.domainType === 'EnumerationValue') {
            let dataTypeId = element.dataType;
            if (!dataTypeId) {
                dataTypeId = element.breadcrumbs[1].id;
            }
            return this.stateHandler.getURL('appContainer.mainApp.twoSidePanel.catalogue.' + types.find(x => x.id === element.domainType).link,
                {
                    id: dataTypeId,
                    dataModelId: parentDataModel,
                });
        }

        return this.stateHandler.getURL('appContainer.mainApp.twoSidePanel.catalogue.' + types.find(x => x.id === element.domainType).link,
            {
                id: element.id,
                dataModelId: parentDataModel,
                dataClassId: parentDataClass,
                terminologyId: element.terminology,
                domainType: element.domainType,
                mode
            });
    }
}

export class Type {

    constructor() { }

    id: string;
    link: string;
    title: string;
    markdown: string;
    isBase?: boolean;
    baseTitle?: string;
    classifiable?: boolean;
    displayLabel?: string;
    resourceName?: string;
}
