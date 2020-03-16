import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {SecurityHandlerService} from '../services/handlers/security-handler.service';

@Directive({
  selector: '[mdmShowIfRolesWritable]'
})
export class ShowIfRolesWritableDirective implements OnInit {
@Input() result: any;
  constructor(private securityHandler: SecurityHandlerService, private elementRef: ElementRef) {

  }
  ngOnInit(): void {
    this.watchRole(this.result);
  }
  watchRole(newValue) {
    const show = this.securityHandler.showIfRoleIsWritable(newValue);
    if (!show) {
      this.elementRef.nativeElement.style.display = 'none';
      return;
    }
  }

}
