import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  transform(bytes, precision?): any {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) { return '-'; }
    if (typeof precision === 'undefined') { precision = 1; }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const num = Math.floor(Math.log(bytes) / Math.log(1024));

    return ((bytes / Math.pow(1024, Math.floor(num))).toFixed(precision) + ' ' + units[num]);
  }
}
