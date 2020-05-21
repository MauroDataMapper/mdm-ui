import {Injectable} from '@angular/core';
import {ElementTypesService} from '@mdm/services/element-types.service';
import marked from 'marked/lib/marked';
import {CustomTokenizerService} from "@mdm/utility/markdown/markdown-parser/custom-tokenizer.service";
import {CustomHtmlRendererService} from "@mdm/utility/markdown/markdown-parser/custom-html-renderer.service";
import {CustomTextRendererService} from "@mdm/utility/markdown/markdown-parser/custom-text-renderer.service";

@Injectable({
  providedIn: 'root'
})
export class MarkdownParserService {

  constructor(private elementTypes: ElementTypesService,
              private tokenizer: CustomTokenizerService,
              private customHtmlRendererService: CustomHtmlRendererService,
              private customTextRendererService: CustomTextRendererService) {
  }



  public parse(source, renderType) {
    let renderer: marked.Renderer = this.customHtmlRendererService;
    if (renderType === 'text') {
      renderer = this.customTextRendererService;
    }

    marked.use({tokenizer: this.tokenizer as any});
    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
    });

    return marked(source);
  }

  public createMarkdownLink(element) {
    const baseTypes = this.elementTypes.getTypes();

    const dataTypeNames = this.elementTypes
      .getTypesForBaseTypeArray('DataType')
      .map((dt) => {
        return dt.id;
      });

    let str = `[${element.label}](MC|${baseTypes.find(x => x.id === element.domainType).markdown}|`;

    if (element.domainType === 'Folder') {
      str += element.id;
    }

    if (element.domainType === 'Classifier') {
      str += element.id;
    }

    if (element.domainType === 'DataModel') {
      str += element.id;
    }

    let dataModelId = element.dataModel;
    if (!dataModelId && element.breadcrumbs) {
      dataModelId = element.breadcrumbs[0].id;
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

    if (element.domainType === 'DataType' || dataTypeNames.indexOf(element.domainType) !== -1) {
      str += dataModelId + '|' + element.id;
    }

    if (element.domainType === 'EnumerationValue') {
      str += dataModelId + '|' + element.dataType;
    }

    if (element.domainType === 'DataClass' && !parentDataClassId) {
      str += dataModelId + '|' + element.id;
    }

    if (element.domainType === 'DataClass' && parentDataClassId) {
      str += dataModelId + '|' + parentDataClassId + '|' + element.id;
    }

    if (element.domainType === 'DataElement') {
      str += dataModelId + '|' + parentDataClassId + '|' + element.id;
    }

    if (element.domainType === 'Terminology') {
      str += element.id;
    }

    if (element.domainType === 'Term') {
      str += element.terminology + '|' + element.id;
    }

    str += ')';
    return str;
  }


}
