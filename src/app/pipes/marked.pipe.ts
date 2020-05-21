import { Pipe, PipeTransform } from '@angular/core';
import marked from 'marked/lib/marked';

/**
 * A utility to do simple markdown parsing.
 *
 * Usage: <span [innerHTML]="value | marked:<options>"></span>
 */
@Pipe({ name: 'marked' })
export class MarkedPipe implements PipeTransform {

  transform(value: string, options = {}) {
    if (value) {
      const md = marked.setOptions(options);
      return md.parse(value);
    }
    return value;
  }
}
