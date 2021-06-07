import { Component, Input, OnInit } from '@angular/core';
import { DefaultProfileControls } from '@mdm/model/defaultProfileModel';

@Component({
  selector: 'mdm-default-profile',
  templateUrl: './default-profile.component.html',
  styleUrls: ['./default-profile.component.scss']
})
export class DefaultProfileComponent implements OnInit {

 @Input() catalogueItem : any;

 controls: Array<string>;

  constructor() {
  }

  ngOnInit(): void {
    this.controls = DefaultProfileControls.renderControls(this.catalogueItem.domainType);
  }

  isInControlList(control: string) : boolean
  {
    return this.controls.findIndex(x => x === control) !== -1;
  }

}
