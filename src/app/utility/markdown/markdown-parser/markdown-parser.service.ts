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
import { ElementTypesService } from '@mdm/services/element-types.service';
import marked from 'marked/lib/marked';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService } from '@mdm/services/broadcast.service';
import { CustomTokenizerService } from '@mdm/utility/markdown/markdown-parser/custom-tokenizer.service';
import { CustomHtmlRendererService } from '@mdm/utility/markdown/markdown-parser/custom-html-renderer.service';
import { CustomTextRendererService } from '@mdm/utility/markdown/markdown-parser/custom-text-renderer.service';

@Injectable({
  providedIn: 'root'
})
export class MarkdownParserService {

  constructor(private elementTypes: ElementTypesService,
    private tokenizer: CustomTokenizerService,
    private customHtmlRendererService: CustomHtmlRendererService,
    private customTextRendererService: CustomTextRendererService,
    private resourcesService: MdmResourcesService,
    private broadcastSvc: BroadcastService) {
  }

  public parse(source: string, renderType : string) {

    // Find only the text within brackets and replace the empty spaces with a special char ^ in order to be able to parse the markdown link
     source = source?.replace(/\[([^\]]+)\]\(([^\)]+)\)/gm, ($0, $1, $2) => `[${$1}](${$2.replace(/\s/gm, '^')})`);

    let renderer: marked.Renderer = this.customHtmlRendererService;
    if (renderType === 'text') {
      renderer = this.customTextRendererService;
    }

    marked.use({ tokenizer: this.tokenizer as any });
    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
    });

    if (source) {
       source = marked(source);
       source = source?.replace('\\r\\n','');
      return source;
    }
  }

  public async createMarkdownLink(element) {
    const baseTypes = this.elementTypes.getTypes();

    const dataTypeNames = this.elementTypes.getTypesForBaseTypeArray('DataType').map((dt) => {
      return dt.id;
    });

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
      parentDataClassId = element.breadcrumbs[element.breadcrumbs.length - 1].id;
    }

    let str = '';
    if (element.domainType === 'DataClass') {
      const dataModelName = await this.getDataModelName(parentId);
      str = `[${element.label}](dm:${dataModelName}|${baseTypes.find(x => x.id === element.domainType).markdown}:${element.label}`;
    }

    if (element.domainType === 'DataModel') {
      str = `[${element.label}](${baseTypes.find(x => x.id === element.domainType).markdown}:${element.label}`;
    }

    if (element.domainType === 'DataType' || dataTypeNames.includes(element.element?.domainType)) {
      let dataModelName = '';
      if (!parentId) {
        parentId = element.element.model;
        dataModelName = await this.getDataModelName(parentId);
        str += `[${element.element.label}](dm:${dataModelName}|${baseTypes.find(x => x.id === element.element.domainType).markdown}:${element.element.label}`;
      } else {
        dataModelName = await this.getDataModelName(parentId);
        str += `[${element.label}](dm:${dataModelName}|${baseTypes.find(x => x.id === element.domainType).markdown}:${element.label}`;
      }
    }

    if (element.domainType === 'DataElement' || element.element?.domainType === 'DataElement') {
      let dataModelName = '';
      let dataClassName = '';
      if (!parentId) {
        parentId = element.element.model;
        parentDataClassId = element.element.dataClass;
        dataModelName = await this.getDataModelName(parentId);
        dataClassName = await this.getDataClassName(parentId, parentDataClassId);
        str += `[${element.element.label}](dm:${dataModelName}|dc:${dataClassName}|${baseTypes.find(x => x.id === element.element.domainType).markdown}:${element.element.label}`;
      } else {
        dataModelName = await this.getDataModelName(parentId);
        dataClassName = await this.getDataClassName(parentId, parentDataClassId);
        str += `[${element.label}](dm:${dataModelName}|dc:${dataClassName}|${baseTypes.find(x => x.id === element.domainType).markdown}:${element.label}`;
      }
    }

    if (element.domainType === 'Term') {
      const terminologyName = await this.getTerminologyName(parentId);
      str += `[${element.label}](te:${terminologyName}|${baseTypes.find(x => x.id === element.domainType).markdown}:${element.label}`;
    }

    if (element.domainType === 'CodeSet') {
      str = `[${element.label}](${baseTypes.find(x => x.id === element.domainType).markdown}:${element.label}`;
    }

    // Not supported at the moment. Keeping for further use.
    // if (element.domainType === 'Folder') {
    //  str = `[${element.label}](${baseTypes.find(x => x.id === element.domainType).markdown}:${element.label}`;
    // }

    str += ')';
    return str;
  }

  private async getDataModelName(id: any) {
    const response = await this.resourcesService.dataModel.get(id).toPromise();
    return response.body.label;
  }

  private async getTerminologyName(id: any) {
    const response = await this.resourcesService.terminology.get(id).toPromise();
    return response.body.label;
  }

  private async getDataClassName(dataModelId: any, id: any) {
    const response = await this.resourcesService.dataClass.get(dataModelId, id).toPromise();
    return response.body.label;
  }
}
