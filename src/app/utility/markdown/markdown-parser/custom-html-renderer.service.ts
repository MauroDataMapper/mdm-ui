import {Injectable} from '@angular/core';
import marked from 'marked/lib/marked';
import {LinkCreatorService} from "@mdm/utility/markdown/markdown-parser/link-creator.service";
import {Renderer} from "marked";

@Injectable({
  providedIn: 'root'
})
export class CustomHtmlRendererService extends marked.Renderer {

  constructor(private linkCreatorService: LinkCreatorService) {
    super();
  }

  link = (href: string, title: any, text: string) => {
    if (href && href.indexOf('MC|') === 0) {
      const link = this.linkCreatorService.createLink(href, title, text);
      return `<a href='${link}'>${text}</a>`;
    }
    // return the actual format if it does not star with MC
    return `<a href='${href}' target="_blank">${text}</a>`;
  };

  // just reduce header tags for one level
  heading = (text, level, rawtext) => {
    const l = level + 1;
    return `<h${l}>${text}</h${l}>`;
  };

  table = (header, body) => {
    let table = `<table class='table table-bordered'>`;
    table += header + body;
    table += `</table>`;
    return table;
  };


}
