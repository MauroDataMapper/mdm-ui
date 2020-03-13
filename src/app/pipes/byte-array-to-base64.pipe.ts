import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'byteArrayToBase64'
})
export class ByteArrayToBase64Pipe implements PipeTransform {

  transform(value: any): any {
      let binary = '';
      const bytes = new Uint8Array(value);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);

  }

}
