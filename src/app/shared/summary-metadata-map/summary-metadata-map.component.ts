import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mdm-summary-metadata-map',
  templateUrl: './summary-metadata-map.component.html',
  styleUrls: ['./summary-metadata-map.component.sass']
})
export class SummaryMetadataMapComponent implements OnInit {
  @Input() summary: any;
  @Input() chartType: any;
  @Input() showMoreDetailsBtn: boolean;

  constructor() {}

  ngOnInit() {}
}
