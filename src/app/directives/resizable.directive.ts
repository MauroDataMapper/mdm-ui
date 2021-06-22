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

import { Directive, ElementRef, OnInit, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[mdmResizable]' // Attribute selector
})
export class ResizableDirective implements OnInit {
  @Input() resizableGrabWidth = 4;
  @Input() resizableMinWidth = 10;

  dragging = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    const newWidth = (wid) => {
      const newWidthCalc = Math.max(this.resizableMinWidth, wid);
      this.renderer.setStyle(
        this.el.nativeElement,
        'width',
        `${newWidthCalc}px`
      );
    };

    const mouseMoveGlobal = (evt) => {
      if (!this.dragging) {
        return;
      }
      newWidth(evt.clientX - el.nativeElement.offsetLeft);
      evt.stopPropagation();
    };

    const mouseUpGlobal = (evt) => {
      if (!this.dragging) {
        return;
      }
      this.restoreGlobalMouseEvents();
      this.dragging = false;
      evt.stopPropagation();
    };

    const mouseDown = (evt) => {
      if (this.inDragRegion(evt)) {
        this.dragging = true;
        this.preventGlobalMouseEvents();
        evt.stopPropagation();
      }
    };

    const mouseMove = (evt) => {
      if (this.inDragRegion(evt) || this.dragging) {
        el.nativeElement.style.cursor = 'col-resize';
      } else {
        el.nativeElement.style.cursor = 'default';
      }
    };

    document.addEventListener('mousemove', mouseMoveGlobal, true);
    document.addEventListener('mouseup', mouseUpGlobal, true);
    el.nativeElement.addEventListener('mousedown', mouseDown, true);
    el.nativeElement.addEventListener('mousemove', mouseMove, true);
  }

  preventGlobalMouseEvents() {
    document.body.style['pointer-events'] = 'none';
  }

  restoreGlobalMouseEvents() {
    document.body.style['pointer-events'] = 'auto';
  }

  ngOnInit(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'border-right',
      `${this.resizableGrabWidth}px solid darkgrey`
    );
  }

  inDragRegion(evt) {
    const cw: number = this.el.nativeElement.clientWidth;
    const cx: number = evt.clientX;
    const osl: number = this.el.nativeElement.offsetLeft;
    return cw - cx + osl < this.resizableGrabWidth;
  }
}
