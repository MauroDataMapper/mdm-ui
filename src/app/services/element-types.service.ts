/*
Copyright 2020-2023 University of Oxford and NHS England

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
import {
  CatalogueItemDomainType,
  MdmResponse,
  Modelable,
  Uuid
} from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
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
      domainName: 'folders',
      isBase: true
    },
    {
      id: 'VersionedFolder',
      link: 'versionedFolder',
      title: 'VersionedFolder',
      markdown: 'vfd',
      baseTitle: 'VersionedFolder',
      domainName: 'versionedFolders',
      isBase: true
    },
    {
      id: 'DataModel',
      link: 'dataModel',
      title: 'DataModel',
      markdown: 'dm',
      baseTitle: 'DataModel',
      domainName: 'dataModels',
      isBase: true,
      classifiable: true
    },
    {
      id: 'ReferenceDataModel',
      link: 'ReferenceDataModel',
      title: 'ReferenceDataModel',
      resourceName: 'ReferenceDataModel',
      baseTitle: 'ReferenceDataModel',
      domainName: 'referenceDataModels',
      markdown: 'rdm',
      classifiable: true
    },
    {
      id: 'DataClass',
      link: 'dataClass',
      title: 'DataClass',
      markdown: 'dc',
      baseTitle: 'DataClass',
      domainName: 'dataClasses',
      isBase: true,
      classifiable: true
    },
    {
      id: 'DataElement',
      link: 'dataElement',
      title: 'DataElement',
      markdown: 'de',
      baseTitle: 'DataElement',
      domainName: 'dataElements',
      isBase: true,
      classifiable: true
    },
    {
      id: 'ReferenceDataElement',
      link: 'dataElement',
      title: 'DataElement (ReferenceDataElement)',
      baseTitle: 'DataElement',
      domainName: 'referenceDataElements',
      markdown: 'rde',
      classifiable: true
    },
    {
      id: 'DataType',
      link: 'dataType',
      title: 'DataType',
      markdown: 'dt',
      isBase: true,
      classifiable: true,
      baseTitle: 'DataType',
      domainName: 'dataTypes'
    },
    {
      id: 'EnumerationType',
      link: 'dataType',
      title: 'DataType (Enum)',
      baseTitle: 'DataType',
      markdown: 'dt',
      displayLabel: 'Enumeration',
      classifiable: true,
      domainName: 'enumerationTypes'
    },
    {
      id: 'PrimitiveType',
      link: 'dataType',
      title: 'DataType (Primitive)',
      baseTitle: 'DataType',
      markdown: 'dt',
      displayLabel: 'Primitive',
      classifiable: true,
      domainName: 'primitiveTypes'
    },
    {
      id: 'ReferencePrimitiveType',
      link: 'referenceDataType',
      title: 'DataType (Reference Data Type)',
      baseTitle: 'Reference Data Type',
      markdown: 'rdt',
      displayLabel: 'Reference Data Type',
      classifiable: true,
      domainName: 'referencePrimitiveTypes'
    },
    {
      id: 'ReferenceType',
      link: 'dataType',
      title: 'DataType (Reference)',
      baseTitle: 'DataType',
      markdown: 'dt',
      displayLabel: 'Reference to DataClass',
      classifiable: true,
      domainName: 'referenceTypes'
    },
    {
      id: 'ModelDataType',
      link: 'dataType',
      title: 'DataType (ModelDataType)',
      baseTitle: 'DataType',
      markdown: 'mdt',
      displayLabel: 'Reference to Model',
      classifiable: true,
      domainName: 'modelDataTypes'
    },
    {
      id: 'TerminologyType',
      link: 'dataType',
      title: 'DataType (Terminology)',
      baseTitle: 'DataType',
      markdown: 'dt',
      displayLabel: 'Reference to Terminology',
      classifiable: true,
      domainName: 'dataTypes'
    },
    {
      id: 'CodeSetType',
      link: 'codeSet',
      title: 'CodeSet',
      baseTitle: 'DataType',
      markdown: 'cst',
      displayLabel: 'Reference to CodeSet',
      classifiable: true,
      domainName: 'dataTypes'
    },
    {
      id: 'ReferenceDataModelType',
      link: 'referenceDataModel',
      title: 'ReferenceDataModel',
      baseTitle: 'DataType',
      markdown: 'rdmt',
      displayLabel: 'Reference to Reference DataModel',
      classifiable: true,
      domainName: 'referenceDataTypes'
    },
    {
      id: 'EnumerationValue',
      link: 'dataType',
      title: 'EnumerationValue',
      baseTitle: 'CatalogueItem',
      markdown: 'ev',
      isBase: true,
      domainName: 'enumerationValues'
    },
    {
      id: 'Terminology',
      link: 'terminology',
      title: 'Terminology',
      baseTitle: 'Terminology',
      markdown: 'te',
      isBase: true,
      domainName: 'terminologies'
    },
    {
      id: 'Term',
      link: 'term',
      title: 'Term',
      baseTitle: 'Term',
      markdown: 'tm',
      isBase: true,
      domainName: 'terms'
    },
    {
      id: 'CodeSet',
      link: 'codeSet',
      title: 'CodeSet',
      baseTitle: 'CodeSet',
      markdown: 'cs',
      isBase: true,
      domainName: 'codeSets'
    },
    {
      id: 'Classifier',
      link: 'classification',
      title: 'Classifier',
      resourceName: 'classifier',
      baseTitle: 'Classifier',
      markdown: 'cs',
      isBase: true,
      domainName: 'classifiers'
    }
  ];

  private baseTypes: { [key: string]: CatalogueElementType } = {
    DataModel: {
      id: 'DataModel',
      link: 'dataModel',
      title: 'DataModel',
      resourceName: 'dataModel',
      domainName: 'dataModels',
      markdown: 'dm',
      classifiable: true
    },
    ReferenceDataModel: {
      id: 'ReferenceDataModel',
      link: 'ReferenceDataModel',
      title: 'ReferenceDataModel',
      resourceName: 'referenceDataModel',
      domainName: 'referenceDataModels',
      markdown: 'rdm',
      classifiable: true
    },
    DataClass: {
      id: 'DataClass',
      link: 'dataClass',
      title: 'DataClass',
      resourceName: 'dataClass',
      domainName: 'dataClasses',
      markdown: 'dc',
      classifiable: true
    },
    DataElement: {
      id: 'DataElement',
      link: 'dataElement',
      title: 'DataElement',
      resourceName: 'dataElement',
      domainName: 'dataElements',
      markdown: 'de',
      classifiable: true
    },
    DataType: {
      id: 'DataType',
      link: 'dataType',
      title: 'DataType',
      resourceName: 'dataType',
      domainName: 'dataTypes',
      markdown: 'dt',
      classifiable: true
    },
    PrimitiveType: {
      id: 'PrimitiveType',
      link: 'dataType',
      title: 'PrimitiveType',
      resourceName: 'dataType',
      domainName: 'dataTypes',
      markdown: 'dt',
      classifiable: true
    },
    EnumerationType: {
      id: 'EnumerationType',
      link: 'dataType',
      title: 'EnumerationType',
      resourceName: 'dataType',
      domainName: 'dataTypes',
      markdown: 'dt',
      classifiable: true
    },
    classifier: {
      id: 'Classifier',
      link: 'classifier',
      title: 'Classifier',
      resourceName: 'classifier',
      domainName: 'classifiers',
      markdown: 'cs'
    },

    Terminology: {
      id: 'Terminology',
      link: 'terminology',
      title: 'Terminology',
      resourceName: 'terminology',
      domainName: 'terminologies',
      markdown: 'te',
      classifiable: true
    },
    Term: {
      id: 'Term',
      link: 'term',
      title: 'Term',
      resourceName: 'term',
      domainName: 'terms',
      markdown: 'tm',
      classifiable: true
    },
    CodeSet: {
      id: 'CodeSet',
      link: 'codeSet',
      title: 'CodeSet',
      resourceName: 'codeSet',
      domainName: 'codeSets',
      markdown: 'cs',
      classifiable: true
    },

    Folder: {
      id: 'Folder',
      link: 'folder',
      title: 'Folder',
      resourceName: 'folder',
      domainName: 'folders',
      markdown: 'fd',
      classifiable: true
    },

    VersionedFolder: {
      id: 'VersionedFolder',
      link: 'versionedFolder',
      title: 'VersionedFolder',
      resourceName: 'versionedFolder',
      domainName: 'versionedFolders',
      markdown: 'vfd',
      classifiable: true
    },

    EnumerationValue: {
      id: 'EnumerationValue',
      link: 'dataType',
      title: 'EnumerationValue',
      baseTitle: 'CatalogueItem',
      domainName: 'enumerationValues',
      markdown: 'ev',
      isBase: true
    }
  };

  private userTypes: {} = {
    UserGroup: {
      id: 'UserGroup',
      link: 'userGroup',
      title: 'UserGroup',
      resourceName: 'userGroup'
    },
    User: { id: 'User', link: 'user', title: 'User', resourceName: 'user' }
  };

  constructor(
    private stateHandler: StateHandlerService,
    private resources: MdmResourcesService
  ) {}

  getSemanticLinkTypes() {
    return this.semanticLinkTypes;
  }

  getTypes(): CatalogueElementType[] {
    return this.allTypes;
  }

  getAllDataTypesArray() {
    return this.allTypes.filter(
      (f) => f.baseTitle === 'DataType' && f.title !== 'DataType'
    );
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
        if (
          !this.allTypes[property].isBase &&
          this.allTypes[property].baseTitle.toLowerCase() ===
            baseType.toLowerCase()
        ) {
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
      ...Object.keys(this.baseTypes).map((p) => this.baseTypes[p]),
      ...Object.keys(this.userTypes).map((p) => this.userTypes[p])
    ];
    return array;
  }

  getBaseTypes() {
    return this.baseTypes;
  }

  getBaseTypeByName(name: string) {
    const type = this.baseTypes[name];
    if (!type) {
      throw new Error(`Cannot find base type called "${name}"`);
    }
    return type;
  }

  getBaseTypeForDomainType(
    domainType: CatalogueItemDomainType
  ): CatalogueElementType {
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
        parentDataClass =
          element.breadcrumbs[element.breadcrumbs.length - 1].id;
      } else if (element.modelId) {
        parentDataModel = element.modelId;
      }
    }

    if (element.domainType === 'DataElement') {
      if (element.dataClass) {
        parentDataClass = element.dataClass;
      } else if (element.breadcrumbs) {
        parentDataClass =
          element.breadcrumbs[element.breadcrumbs.length - 1].id;
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
      return this.stateHandler.getURL(
        'appContainer.mainApp.twoSidePanel.catalogue.' +
          types.find((x) => x.id === element.domainType).link,
        {
          id: dataTypeId,
          dataModelId: parentDataModel
        }
      );
    }
    return this.stateHandler.getURL(
      'appContainer.mainApp.twoSidePanel.catalogue.' +
        types.find((x) => x.id === element.domainType).link,
      {
        id: element.id,
        dataModelId: parentDataModel,
        dataClassId: parentDataClass,
        terminologyId,
        domainType: element.domainType,
        mode
      }
    );
  }

  /**
   * Get the named link indentifier for a catalogue item. This can be used to dynamically
   * resolve a link to another catalogue element through strings rather than unique IDs.
   *
   * @param element Catalogue element containing the information requried to produce a named link.
   * @returns An observable to subscribe to which will return the named link to the element.
   */
  getNamedLinkIdentifier(element): Observable<string> {
    const baseTypes = this.getTypes();

    const dataTypeNames = this.getTypesForBaseTypeArray('DataType').map(
      (dt) => {
        return dt.id;
      }
    );

    let parentId = null;
    if (element.domainType === 'DataClass') {
      parentId = element.modelId;
    }
    if (!parentId && element.breadcrumbs) {
      parentId = element.breadcrumbs[0].id;
    }

    let parentDataClassId = null;
    if (element.parentDataClass) {
      parentDataClassId = element.parentDataClass;
    } else if (element.dataClass) {
      parentDataClassId = element.dataClass;
    } else if (element.breadcrumbs) {
      parentDataClassId =
        element.breadcrumbs[element.breadcrumbs.length - 1].id;
    }

    if (element.domainType === 'DataClass') {
      return this.getDataModelName(parentId).pipe(
        map(
          (dataModelName) =>
            `dm:${dataModelName}|${
              baseTypes.find((x) => x.id === element.domainType).markdown
            }:${element.label}`
        )
      );
    }

    if (element.domainType === 'DataModel') {
      return of(
        `${baseTypes.find((x) => x.id === element.domainType).markdown}:${
          element.label
        }`
      );
    }

    if (
      element.domainType === 'DataType' ||
      dataTypeNames.includes(element.element?.domainType)
    ) {
      let isHierarchical = false;

      if (!parentId) {
        parentId = element.element.model;
        isHierarchical = true;
      }

      return this.getDataModelName(parentId).pipe(
        map((dataModelName) => {
          if (isHierarchical) {
            return `dm:${dataModelName}|${
              baseTypes.find((x) => x.id === element.element.domainType)
                .markdown
            }:${element.element.label}`;
          } else {
            return `dm:${dataModelName}|${
              baseTypes.find((x) => x.id === element.domainType).markdown
            }:${element.label}`;
          }
        })
      );
    }

    if (
      element.domainType === 'DataElement' ||
      element.element?.domainType === 'DataElement'
    ) {
      let isHierarchical = false;

      if (!parentId) {
        parentId = element.element.model;
        parentDataClassId = element.element.dataClass;
        isHierarchical = true;
      }

      const dataModelName$ = this.getDataModelName(parentId);
      const dataClassName$ = this.getDataClassName(parentId, parentDataClassId);

      return forkJoin([dataModelName$, dataClassName$]).pipe(
        map(([dataModelName, dataClassName]) => {
          if (isHierarchical) {
            return `dm:${dataModelName}|dc:${dataClassName}|${
              baseTypes.find((x) => x.id === element.element.domainType)
                .markdown
            }:${element.element.label}`;
          } else {
            return `dm:${dataModelName}|dc:${dataClassName}|${
              baseTypes.find((x) => x.id === element.domainType).markdown
            }:${element.label}`;
          }
        })
      );
    }

    if (element.domainType === 'Term') {
      return this.getTerminologyName(parentId).pipe(
        map(
          (terminologyName) =>
            `te:${terminologyName}|${
              baseTypes.find((x) => x.id === element.domainType).markdown
            }:${element.label}`
        )
      );
    }

    if (element.domainType === 'CodeSet') {
      return of(
        `${baseTypes.find((x) => x.id === element.domainType).markdown}:${
          element.label
        }`
      );
    }

    return of(null);
  }

  isModelDataType(domainType: CatalogueItemDomainType) {
    return (
      domainType === CatalogueItemDomainType.CodeSetType ||
      domainType === CatalogueItemDomainType.TerminologyType ||
      domainType === CatalogueItemDomainType.ReferenceDataModelType
    );
  }

  private getDataModelName(id: Uuid): Observable<string> {
    return this.resources.dataModel
      .get(id)
      .pipe(map((res: MdmResponse<Modelable>) => res.body.label));
  }

  private getTerminologyName(id: Uuid): Observable<string> {
    return this.resources.terminology
      .get(id)
      .pipe(map((res: MdmResponse<Modelable>) => res.body.label));
  }

  private getDataClassName(dataModelId: Uuid, id: Uuid): Observable<string> {
    return this.resources.dataClass
      .get(dataModelId, id)
      .pipe(map((res: MdmResponse<Modelable>) => res.body.label));
  }
}

export interface CatalogueElementType {
  id: string;
  link: string;
  title: string;
  markdown: string;
  isBase?: boolean;
  baseTitle?: string;
  classifiable?: boolean;
  displayLabel?: string;
  resourceName?: string;
  domainName: string;
}
