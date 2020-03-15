import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'stringify'})
export class StringifyPipe implements PipeTransform {
  transform(value: object, padding: number = 4) {
    if (value) {
      return JSON.stringify(value, null, padding);
    }
    return value;
  }

}
