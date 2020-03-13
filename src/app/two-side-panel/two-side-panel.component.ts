import { Component, AfterViewInit, ViewChild, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { trigger, state, transition, animate, style } from '@angular/animations';

@Component({
  selector: "two-side-panel",
  templateUrl: './two-side-panel.component.html',
  styleUrls: ['./two-side-panel.component.sass'],
  animations: [
    trigger('toggleHeight', [
      state(
        'inactive',
        style({
          height: '0',
          opacity: '0'
        })
      ),
      state(
        'active',
        style({
          height: '*',
          opacity: '1'
        })
      ),
      transition('inactive => active', animate('200ms ease-in')),
      transition('active => inactive', animate('200ms ease-out'))
    ])
  ]
})
export class TwoSidePanelComponent implements AfterViewInit {
  @ViewChild('showHideLeftPane', { static: false }) showHideLeftPane;
  @ViewChild('resizableLeft', { static: false }) resizableLeft;
  @ViewChild('showHidePaneText', { static: false }) showHidePaneText;

  showLeftPane: boolean;

  constructor(private renderer: Renderer2) {}

  expand = false;

  ngAfterViewInit() {
    const width = window.innerWidth;
    this.windowSetup(width);
  }

  toggle = () => {
    this.expand = !this.expand;
  };

  state = 'inactive';

  hideShowLeftPane() {
    this.state = this.state === 'inactive' ? 'active' : 'inactive';

    if (
      this.showHideLeftPane.nativeElement.className.includes('fa-chevron-up')
    ) {
      this.renderer.removeClass(
        this.showHideLeftPane.nativeElement,
        'fa-chevron-up'
      );
      this.renderer.addClass(
        this.showHideLeftPane.nativeElement,
        'fa-chevron-down'
      );
      this.resizableLeft.nativeElement.hidden = true;
      if (this.showHidePaneText) {
        this.renderer.setProperty(
          this.showHidePaneText.nativeElement,
          'innerText',
          'Show Models Tree'
        );
      }
    } else {
      this.renderer.removeClass(
        this.showHideLeftPane.nativeElement,
        'fa-chevron-down'
      );
      this.renderer.addClass(
        this.showHideLeftPane.nativeElement,
        'fa-chevron-up'
      );
      this.resizableLeft.nativeElement.hidden = false;
      if (this.showHidePaneText) {
        this.renderer.setProperty(
          this.showHidePaneText.nativeElement,
          'innerText',
          'Minimise Models Tree'
        );
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    const width = window.innerWidth;
    this.windowSetup(width);
  }

  windowSetup = width => {
    if (width > 800) {
      this.resizableLeft.nativeElement.hidden = false;
      this.renderer.removeClass(
        this.showHideLeftPane.nativeElement,
        'fa-chevron-down'
      );
      this.renderer.addClass(
        this.showHideLeftPane.nativeElement,
        'fa-chevron-up'
      );
      if (this.showHidePaneText) {
        this.renderer.setProperty(
          this.showHidePaneText.nativeElement,
          'innerText',
          'Minimise Models Tree'
        );
      }
    } else {
      this.resizableLeft.nativeElement.hidden = true;
      this.renderer.removeClass(
        this.showHideLeftPane.nativeElement,
        'fa-chevron-up'
      );
      this.renderer.addClass(
        this.showHideLeftPane.nativeElement,
        'fa-chevron-down'
      );
      if (this.showHidePaneText) {
        this.renderer.setProperty(
          this.showHidePaneText.nativeElement,
          'innerText',
          'Show Models Tree'
        );
      }
    }
  }
}
