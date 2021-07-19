import { Component, OnInit } from '@angular/core';
import { StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';

@Component({
  selector: 'mdm-doi-redirect',
  templateUrl: './doi-redirect.component.html',
  styleUrls: ['./doi-redirect.component.scss']
})
export class DoiRedirectComponent implements OnInit {

  constructor(
    private uiRouterGlobals: UIRouterGlobals,
    private stateHandler: StateHandlerService) { }

  ngOnInit(): void {
    const id: string = this.uiRouterGlobals.params.id;
    if (!id) {
      this.stateHandler.Go('home');
      return;
    }

    alert(id);
  }

}
