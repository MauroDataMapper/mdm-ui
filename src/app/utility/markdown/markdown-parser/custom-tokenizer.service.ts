import { Injectable } from '@angular/core';
import marked from 'marked/lib/marked';

@Injectable({
  providedIn: 'root'
})
export class CustomTokenizerService{

  constructor() {
  }

  // to stop the IDE complaining about unknown variable
  rules: any;

  html(html) {
    const cap = this.rules.block.html.exec(html);
    if (cap) {
      return {
        type: 'paragraph',
        raw: cap[0],
        pre: (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        //text: this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0]
        text: cap[0]
      };
    }
  }

}
