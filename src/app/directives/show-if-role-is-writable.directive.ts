import { Directive, ElementRef, Input } from '@angular/core';
import { SecurityHandlerService } from '../services/handlers/security-handler.service';

@Directive({
  selector: '[mdmShowIfRoleIsWritable]'
})
export class ShowIfRoleIsWritableDirective  {

    @Input() mdmShowIfRoleIsWritable: any;

    constructor(private  securityHandler: SecurityHandlerService) { }

    OnInit() {
        const show = this.securityHandler.showIfRoleIsWritable(this.mdmShowIfRoleIsWritable);
        if (!show) {
            this.mdmShowIfRoleIsWritable.nativeElement.hidden = true;
            return;
        }
    }

}
