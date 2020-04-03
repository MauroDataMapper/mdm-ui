import { Injectable } from '@angular/core';
import { ElementTypesService } from '../services/element-types.service';
import marked from 'marked/lib/marked';

@Injectable({
  providedIn: 'root'
})
export class MarkdownParserService {

  constructor(private elementTypes: ElementTypesService) {}

  initialised = false;

  public htmlRenderer() {
    const renderer = new marked.Renderer();

    renderer.link = (href: string, title: any, text: string) => {
      if (href && href.indexOf('MC|') === 0) {
        const link = this.createLink(href, title, text);
        return '<a href="' + link + '">' + text + '</a>';
      }
      // return the actual format if it does not star with MC
      return '<a href="' + href + '" target="_blank">' + text + '</a>';
    };

    // just reduce header tags for one level
    renderer.heading = (text, level, rawtext) => {
      const l = level + 1;
      return '<h' + l + '>' + text + '</h' + l + '>';
    };

    renderer.table = (header, body) => {
      let table = '<table class="table table-bordered">';
      table += header + body;
      table += '</table>';
      return table;
    };
    return renderer;
  }

  // &#63; to ? helper
  public htmlEscapeToText(text) {
    return text.replace(/\&\#[0-9]*;|&amp;/g, (escapeCode) => {
      if (escapeCode.match(/amp/)) {
        return '&';
      }

      return String.fromCharCode(escapeCode.match(/[0-9]+/));
    });
  }

  // return a custom renderer for marked.
  public textRenderer() {
    const render = new marked.Renderer();

    // render just the text of a link
    render.code = (code, language, escaped) => {
      return code;
    };

    render.codespan = (code, language, escaped) => {
      return code;
    };

    // render just the text of a link
    render.strong = (text) => {
      return text;
    };

    // render just the text of a link
    render.link = (href, title, text) => {
      return text;
    };

    (render.html = (html) => {
      return '';
    }),
      // render just the text of a paragraph
      (render.paragraph = text => {
        return this.htmlEscapeToText(text) + '\r\n';
      });

    // render just the text of a heading element, but indecate level
    render.heading = (text, level) => {
      return text;
    };

    // render nothing for images
    render.image = (href, title, text) => {
      return '';
    };

    render.table = (header) => {
      let table = '<br>[';
      const reg = /<th>(.*?)<\/th>/g;
      let match;
      while ((match = reg.exec(header))) {
        table += (match[1] ? match[1] : '...') + ', ';
      }
      table += '...]';
      return table;
    };

    return render;
  }

  public parse(source, renderType) {
    let renderer = this.htmlRenderer();
    if (renderType === 'text') {
      renderer = this.textRenderer();
    }

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
      // sanitize: true,
      sanitizer: (code) => {
        return code;
      }
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

    let str =
      '[' +
      element.label +
      '](MC|' +
      baseTypes.find(x => x.id === element.domainType).markdown +
      '|';

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

    if (
      element.domainType === 'DataType' ||
      dataTypeNames.indexOf(element.domainType) !== -1
    ) {
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

  public createLink(href, title, text) {
    const elements = href.split('|');
    const elementType = elements[1];
    let mcElement = {};

    if (elementType === 'FD') {
      mcElement = {
        id: elements[2],
        domainType: 'Folder'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'CS') {
      mcElement = {
        id: elements[2],
        domainType: 'Classifier'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'DM') {
      mcElement = {
        id: elements[2],
        domainType: 'DataModel'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'DC') {
      mcElement = {
        dataModel: elements[2],
        parentDataClass: elements.length === 5 ? elements[3] : null,
        id: elements.length === 5 ? elements[4] : elements[3],
        domainType: 'DataClass'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'DT' || elementType === 'EV') {
      mcElement = {
        dataModel: elements[2],
        id: elements[3],
        domainType: 'DataType'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'DE') {
      mcElement = {
        dataModel: elements[2],
        dataClass: elements[3],
        id: elements[4],
        domainType: 'DataElement'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'TM') {
      mcElement = {
        terminology: elements[2],
        id: elements[3],
        domainType: 'Term'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }

    if (elementType === 'TG') {
      mcElement = {
        id: elements[2],
        domainType: 'Terminology'
      };
      return this.elementTypes.getLinkUrl(mcElement);
    }
  }
}
