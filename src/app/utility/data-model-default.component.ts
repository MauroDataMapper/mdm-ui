import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-data-model-default',
  templateUrl: './data-model-default.component.html',
  // styleUrls: ['./data-model-default.component.sass']
})
export class DataModelDefaultComponent implements OnInit {

  constructor(private title: Title) { }

  ngOnInit() {
    this.title.setTitle('Browse models');
  }

}
