import { Component, Inject, OnInit } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass']
})
export class AboutComponent implements OnInit {

  constructor(private shared: SharedService, private title: Title) {
    this.appVersion = shared.appVersion;
  }

  public appVersion: string;
  ngOnInit() {
    this.title.setTitle('About');
  }
}
