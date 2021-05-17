/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor() {}

  /* Canvas Download */

  /* Adapted from: https://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas?noredirect=1&lq=1 */
  downloadCanvas(canvas, filename): void {
    /// create an "off-screen" anchor tag
    const lnk = document.createElement('a');

    /// the key here is to set the download attribute of the a tag
    lnk.download = filename;

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    lnk.href = canvas.toDataURL('image/png;base64');

    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {
      const e = document.createEvent('MouseEvents');
      e.initMouseEvent('click', true, true, window,
        0, 0, 0, 0, 0, false, false, false,
        false, 0, null);

      lnk.dispatchEvent(e);
      lnk.remove();
    }
  }

  downloadSVGAsPNG(svg: SVGElement, filename: string, scale: number, width?: number, height?: number) {
    // If we can't get a better size, we'll estimate it here.
    if (!height) {
      height = svg.getBoundingClientRect().height;
    }
    if (!width) {
      width = svg.getBoundingClientRect().width;
    }

    let svgString = new XMLSerializer().serializeToString(svg);
    svgString = svgString.replace(/&nbsp;/g, ' ');

    const canvas = document.createElement('canvas');

    canvas.width = width * scale + 10;
    canvas.height = height * scale + 10;
    canvas.setAttribute('style', 'display: block');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    svg.parentElement.append(canvas);
    // const img = new Image();
    const img = new Image();
    svg.parentElement.append(img);
    img.setAttribute('style', 'display: block');
    img.width = width * (scale + 1);
    img.height = height * (scale + 1);

    const blob = new Blob([svgString], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    img.addEventListener('load', () => {
      URL.revokeObjectURL(url);
      // 5px border all around
      ctx.drawImage(img, 5, 5);
      this.downloadCanvas(canvas, filename);
      canvas.remove();
      img.remove();
    }, {once: true});
    img.src = url;

    // var img1 = new Image(); // Image constructor
    // img1.src = 'image1.png';
    // img1.alt = 'alt';
    // document.body.appendChild(img1);

    // var img2 = document.createElement('img'); // Use DOM HTMLImageElement
    // img2.src = 'image2.jpg';
    // img2.alt = 'alt text';
    // document.body.appendChild(img2);
  }

}
