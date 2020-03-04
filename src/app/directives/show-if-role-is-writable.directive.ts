import { Directive, ElementRef, Input } from '@angular/core';
import { SecurityHandlerService } from "../services/handlers/security-handler.service";

@Directive({
  selector: '[appShowIfRoleIsWritable]'
})
export class ShowIfRoleIsWritableDirective  {

    @Input() appShowIfRoleIsWritable: any;

    constructor(private  securityHandler: SecurityHandlerService) { }

    OnInit() {
        var show = this.securityHandler.showIfRoleIsWritable(this.appShowIfRoleIsWritable);
        if (!show) {
            this.appShowIfRoleIsWritable.nativeElement.hidden = true;
            return;
        }
    }

}
