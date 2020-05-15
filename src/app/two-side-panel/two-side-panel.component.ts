import { Component, AfterViewInit, ViewChild, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'mdm-two-side-panel',
  templateUrl: './two-side-panel.component.html',
  styleUrls: ['./two-side-panel.component.sass'],
  animations: [
    trigger('openClose', [
      state( 'closed', style({ height: '0', opacity: '0', display: 'none' })),
      state( 'open', style({ height: '*', opacity: '1', display: 'block' })),
      transition('closed => open', animate('30ms ease-in')),
      transition('open => closed', animate('30ms ease-out'))
    ])
  ]
})
export class TwoSidePanelComponent implements AfterViewInit {

  constructor(private renderer: Renderer2) {}
  @ViewChild('showHideLeftPane', { static: false }) showHideLeftPane;
  @ViewChild('resizableLeft', { static: false }) resizableLeft;
  @ViewChild('showHidePaneText', { static: false }) showHidePaneText;

  showLeftPane: boolean;
  state = 'inactive';
  isOpen = true;

  ngAfterViewInit() {
    const width = window.innerWidth;
    // this.windowSetup(width);
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  hideShowLeftPane() {
    this.state = this.state === 'inactive' ? 'active' : 'inactive';
    console.log(this.state);
    if (this.showHideLeftPane.nativeElement.className.includes('fa-chevron-up')) {
      this.renderer.removeClass(this.showHideLeftPane.nativeElement, 'fa-chevron-up');
      this.renderer.addClass(this.showHideLeftPane.nativeElement, 'fa-chevron-down');
      this.resizableLeft.nativeElement.hidden = true;
    } else {
      this.renderer.removeClass(this.showHideLeftPane.nativeElement, 'fa-chevron-down');
      this.renderer.addClass(this.showHideLeftPane.nativeElement, 'fa-chevron-up');
      this.resizableLeft.nativeElement.hidden = false;
    }
  }

  // @HostListener('window:resize', ['$event'])
  // onResize() {
  //   const width = window.innerWidth;
  //   this.windowSetup(width);
  //   console.log(width);
  // }

  // windowSetup = width => {
  //   if (width > 800) {
  //     this.resizableLeft.nativeElement.hidden = false;
  //     this.renderer.removeClass(this.showHideLeftPane.nativeElement, 'fa-chevron-down');
  //     this.renderer.addClass(this.showHideLeftPane.nativeElement, 'fa-chevron-up' );
  //   } else {
  //     this.resizableLeft.nativeElement.hidden = true;
  //     this.renderer.removeClass(this.showHideLeftPane.nativeElement, 'fa-chevron-up');
  //     this.renderer.addClass(this.showHideLeftPane.nativeElement, 'fa-chevron-down');
  //   }
  // }
}
