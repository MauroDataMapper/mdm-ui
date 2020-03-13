import { Component, Inject, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-about',
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
