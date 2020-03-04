import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'byteArrayToBase64'
})
export class ByteArrayToBase64Pipe implements PipeTransform {

  transform(value: any): any {
      var binary = '';
      var bytes = new Uint8Array(value);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
  
  }

}
