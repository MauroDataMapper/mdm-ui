import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: "summary-metadata-map",
  templateUrl: './summary-metadata-map.component.html',
  styleUrls: ['./summary-metadata-map.component.sass']
})
export class SummaryMetadataMapComponent implements OnInit {
  @Input('summary') summary: any;
  @Input('chart-type') chartType: any;
  @Input('show-more-details-btn') showMoreDetailsBtn: boolean;

  constructor() {}

  ngOnInit() {}
}
