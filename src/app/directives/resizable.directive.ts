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
      this.renderer.setStyle(this.el.nativeElement,'width',`${newWidthCalc}px`);
    };


    const mouseMoveG = (evt) => {
      if (!this.dragging) {
        return;
      }
      newWidth(evt.clientX - el.nativeElement.offsetLeft);
      evt.stopPropagation();
    };

    const mouseUpG = (evt) => {
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


    document.addEventListener('mousemove', mouseMoveG, true);
    document.addEventListener('mouseup', mouseUpG, true);
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
    this.renderer.setStyle(this.el.nativeElement,'border-right',`${this.resizableGrabWidth}px solid darkgrey`);
  }

  inDragRegion(evt) {
    const cw : number = this.el.nativeElement.clientWidth;
    const cx : number = evt.clientX;
    const osl: number = this.el.nativeElement.offsetLeft;
    return cw -cx + osl < this.resizableGrabWidth;
  }

}
