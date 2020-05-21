import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'mchighlighter'})
export class HighlighterPipe implements PipeTransform {

  transform(value: string, phrase: string, wildcardMatch?: boolean) {
    let text = value;
    if (phrase && value && phrase.trim().length > 0 && value.trim().length > 0) {
      // if wildcardMatch then for "patient demographic" it should match patient and demographic
      if (wildcardMatch) {
        const sections: string[] = phrase.split(' ');
        sections.forEach(section => {
          text = value.replace(new RegExp('(' + escape(section) + ')', 'gi'), '<span class="mchighlighter">$1</span>');
        });
      } else {
        text = value.replace(new RegExp('(' + escape(phrase) + ')', 'gi'), '<span class="mchighlighter">$1</span>');
      }
    }
    return text;
  }

}
