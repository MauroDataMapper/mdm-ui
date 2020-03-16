import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any) {

  return value.filter(val => val.canExportMultipleDomains === true);
  }

}
