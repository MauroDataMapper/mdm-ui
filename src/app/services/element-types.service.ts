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
import { Injectable } from '@angular/core';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { StateHandlerService } from './handlers/state-handler.service';

@Injectable({ providedIn: 'root' })
export class ElementTypesService {


  private semanticLinkTypes: any = {
    Refines: { title: 'Refines', editable: true },
    'Does Not Refine': { title: 'Does Not Refine', editable: true },

    'Is From': { title: 'Is From', editable: false },
    'Superseded By': { title: 'Superseded By', editable: false },
    'New Version Of': { title: 'New Version Of', editable: false }
  };

  private allTypes: CatalogueElementType[] = [
    {
      id: 'Folder',
      link: 'folder',
      title: 'Folder',
      markdown: 'fd',
      baseTitle: 'Folder',
      isBase: true
    },
    {
      id: 'VersionedFolder',
      link: 'versionedFolder',
      title: 'VersionedFolder',
      markdown: 'vfd',
      baseTitle: 'VersionedFolder',
      isBase: true
    },
    {
      id: 'DataModel',
      link: 'dataModel',
      title: 'DataModel',
      markdown: 'dm',
      baseTitle: 'DataModel',
      isBase: true,
      classifiable: true
    },
    {
      id: 'ReferenceDataModel',
      link: 'ReferenceDataModel',
      title: 'ReferenceDataModel',
      resourceName: 'ReferenceDataModel',
      baseTitle: 'ReferenceDataModel',
      markdown: 'rdm',
      classifiable: true
    },
    {
      id: 'DataClass',
      link: 'dataClass',
      title: 'DataClass',
      markdown: 'dc',
      baseTitle: 'DataClass',
      isBase: true,
      classifiable: true
    },
    {
      id: 'DataElement',
      link: 'dataElement',
      title: 'DataElement',
      markdown: 'de',
      baseTitle: 'DataElement',
      isBase: true,
      classifiable: true
    },
    {
      id: 'ReferenceDataElement',
      link: 'dataElement',
      title: 'DataElement (ReferenceDataElement)',
      baseTitle: 'DataElement',
      markdown: 'rde',
      classifiable: true
    },
    { id: 'DataType', link: 'dataType', title: 'DataType', markdown: 'dt', isBase: true, classifiable: true, baseTitle: 'DataType' },
    {
      id: 'EnumerationType',
      link: 'dataType',
      title: 'DataType (Enum)',
      baseTitle: 'DataType',
      markdown: 'dt',
      displayLabel: 'Enumeration',
      classifiable: true
    },
    {
      id: 'PrimitiveType',
      link: 'dataType',
      title: 'DataType (Primitive)',
      baseTitle: 'DataType',
      markdown: 'dt',
      displayLabel: 'Primitive',
      classifiable: true
    },
    {
      id: 'ReferencePrimitiveType',
      link: 'referenceDataType',
      title: 'DataType (Reference Data Type)',
      baseTitle: 'Reference Data Type',
      markdown: 'rdt',
      displayLabel: 'Reference Data Type',
      classifiable: true
    },
    {
      id: 'ReferenceType',
      link: 'dataType',
      title: 'DataType (Reference)',
      baseTitle: 'DataType',
      markdown: 'dt',
      displayLabel: 'Reference',
      classifiable: true
    },
    {
      id: 'ModelDataType',
      link: 'dataType',
      title: 'DataType (ModelDataType)',
      baseTitle: 'DataType',
      markdown: 'mdt',
      displayLabel: 'ModelDataType',
      classifiable: true
    },
    {
      id: 'TerminologyType',
      link: 'dataType',
      title: 'DataType (Terminology)',
      baseTitle: 'DataType',
      markdown: 'dt',
      displayLabel: 'Terminology',
      classifiable: true
    },
    {
      id: 'CodeSetType',
      link: 'codeSet',
      title: 'CodeSet',
      baseTitle: 'DataType',
      markdown: 'cst',
      displayLabel: 'Code Set',
      classifiable: true
    },
    {
      id: 'ReferenceDataModelType',
      link: 'referenceDataModel',
      title: 'ReferenceDataModel',
      baseTitle: 'DataType',
      markdown: 'rdmt',
      displayLabel: 'Reference Data Model',
      classifiable: true
    },
    {
      id: 'EnumerationValue',
      link: 'dataType',
      title: 'EnumerationValue',
      baseTitle: 'CatalogueItem',
      markdown: 'ev',
      isBase: true
    },
    {
      id: 'Terminology',
      link: 'terminology',
      title: 'Terminology',
      baseTitle: 'Terminology',
      markdown: 'te',
      isBase: true
    },
    { id: 'Term', link: 'term', title: 'Term', baseTitle: 'Term', markdown: 'tm', isBase: true },
    { id: 'CodeSet', link: 'codeSet', title: 'CodeSet', baseTitle: 'CodeSet', markdown: 'cs', isBase: true },
    {
      id: 'Classifier',
      link: 'classification',
      title: 'Classifier',
      resourceName: 'classifier',
      baseTitle: 'Classifier',
      markdown: 'cs',
      isBase: true
    },
  ];

  private baseTypes: { [key: string]: CatalogueElementType } = {
    DataModel: {
      id: 'DataModel',
      link: 'dataModel',
      title: 'DataModel',
      resourceName: 'dataModel',
      markdown: 'dm',
      classifiable: true
    },
    ReferenceDataModel: {
      id: 'ReferenceDataModel',
      link: 'ReferenceDataModel',
      title: 'ReferenceDataModel',
      resourceName: 'referenceDataModel',
      markdown: 'rdm',
      classifiable: true
    },
    DataClass: {
      id: 'DataClass',
      link: 'dataClass',
      title: 'DataClass',
      resourceName: 'dataClass',
      markdown: 'dc',
      classifiable: true
    },
    DataElement: {
      id: 'DataElement',
      link: 'dataElement',
      title: 'DataElement',
      resourceName: 'dataElement',
      markdown: 'de',
      classifiable: true
    },
    DataType: {
      id: 'DataType',
      link: 'dataType',
      title: 'DataType',
      resourceName: 'dataType',
      markdown: 'dt',
      classifiable: true
    },

    Classifier: {
      id: 'Classifier',
      link: 'classifier',
      title: 'Classifier',
      resourceName: 'classifier',
      markdown: 'cs'
    },

    Terminology: {
      id: 'Terminology',
      link: 'terminology',
      title: 'Terminology',
      resourceName: 'terminology',
      markdown: 'te',
      classifiable: true
    },
    Term: { id: 'Term', link: 'term', title: 'Term', resourceName: 'term', markdown: 'tm', classifiable: true },
    CodeSet: {
      id: 'CodeSet',
      link: 'codeSet',
      title: 'CodeSet',
      resourceName: 'codeSet',
      markdown: 'cs',
      classifiable: true
    },

    Folder: {
      id: 'Folder',
      link: 'folder',
      title: 'Folder',
      resourceName: 'folder',
      markdown: 'fd',
      classifiable: true
    },

    VersionedFolder: {
      id: 'VersionedFolder',
      link: 'versionedFolder',
      title: 'VersionedFolder',
      resourceName: 'versionedFolder',
      markdown: 'vfd',
      classifiable: true
    },

    EnumerationValue: {
      id: 'EnumerationValue',
      link: 'dataType',
      title: 'EnumerationValue',
      baseTitle: 'CatalogueItem',
      markdown: 'ev',
      isBase: true
    },

  };

  private userTypes: {} = {
    UserGroup: { id: 'UserGroup', link: 'userGroup', title: 'UserGroup', resourceName: 'userGroup' },
    User: { id: 'User', link: 'user', title: 'User', resourceName: 'user' },
  };

  constructor(private stateHandler: StateHandlerService) { }

  getSemanticLinkTypes() {
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

  getBaseTypes() {
    return this.baseTypes;
  }

  getBaseTypeForDomainType(domainType: CatalogueItemDomainType): CatalogueElementType {
    return this.baseTypes[domainType];
  }

  getLinkUrl(element, mode?) {
    if (!element || !element.id) {
      return '';
    }

    const types = this.getTypes();
    let parentDataModel = null;
    let parentDataClass = null;
    let terminologyId = null;
    if (element.model) {
      parentDataModel = element.model;
    } else if (element.breadcrumbs) {
      parentDataModel = element.breadcrumbs[0].id;
    }

    if (element.domainType === 'DataClass') {
      if (element.parentDataClass) {
        parentDataClass = element.parentDataClass;
      } else if (element.breadcrumbs && element.breadcrumbs.length >= 2) {
        parentDataClass = element.breadcrumbs[element.breadcrumbs.length - 1].id;
      } else if (element.modelId) {
        parentDataModel = element.modelId;
      }
    }


    if (element.domainType === 'DataElement') {
      if (element.dataClass) {
        parentDataClass = element.dataClass;
      } else if (element.breadcrumbs) {
        parentDataClass = element.breadcrumbs[element.breadcrumbs.length - 1].id;
      }
    }

    if (element.domainType === 'Term') {
      if (element.terminology) {
        terminologyId = element.terminology;
      } else if (element.breadcrumbs) {
        terminologyId = element.breadcrumbs[element.breadcrumbs.length - 1].id;
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
        terminologyId,
        domainType: element.domainType,
        mode
      });
  }

  isModelDataType(domainType: CatalogueItemDomainType) {
    return domainType === CatalogueItemDomainType.CodeSetType
      || domainType === CatalogueItemDomainType.TerminologyType
      || domainType === CatalogueItemDomainType.ReferenceDataModelType;
  }
}

export class CatalogueElementType {
  id: string;
  link: string;
  title: string;
  markdown: string;
  isBase?: boolean;
  baseTitle?: string;
  classifiable?: boolean;
  displayLabel?: string;
  resourceName?: string;
  constructor() { }
}
