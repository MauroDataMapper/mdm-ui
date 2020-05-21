import { Injectable } from '@angular/core';
import marked from 'marked/lib/marked'
import {LinkCreatorService} from "@mdm/utility/markdown/markdown-parser/link-creator.service";
@Injectable({
  providedIn: 'root'
})
export class CustomTextRendererService extends marked.Renderer{

  constructor(private linkCreatorService: LinkCreatorService) {
    super();
  }

  // render just the text of a link
  code = (code, language, escaped) => {
    return code;
  };

  codespan = (code, language, escaped) => {
    return code;
  };

  // render just the text of a link
  strong = (text) => {
    return text;
  };

  // render just the text of a link
  link = (href, title, text) => {
    return text;
  };

  html = (html) => {
    return '';
  };

  // render just the text of a paragraph
  paragraph = text => {
    return this.htmlEscapeToText(text) + '\r\n';
  };

  // render just the text of a heading element, but indecate level
  heading = (text, level) => {
    return text;
  };

  // render nothing for images
  image = (href, title, text) => {
    return '';
  };

  table = (header) => {
    let table = '<br>[';
    const reg = /<th>(.*?)<\/th>/g;
    let match;
    while ((match = reg.exec(header))) {
      table += (match[1] ? match[1] : '...') + ', ';
    }
    table += '...]';
    return table;
  };

  // &#63; to ? helper
  public htmlEscapeToText(text) {
    return text.replace(/\&\#[0-9]*;|&amp;/g, (escapeCode) => {
      if (escapeCode.match(/amp/)) {
        return '&';
      }

      return String.fromCharCode(escapeCode.match(/[0-9]+/));
    });
  }

}
