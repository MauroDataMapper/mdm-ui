import { Component, Inject, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'mdm-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass']
})
export class AboutComponent implements OnInit {

  constructor(private shared: SharedService) {
    this.appVersion = shared.appVersion;
  }

  public appVersion: string;
  ngOnInit() {}
}
