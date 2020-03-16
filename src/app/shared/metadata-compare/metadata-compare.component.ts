import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mdm-metadata-compare',
  templateUrl: './metadata-compare.component.html',
  styleUrls: ['./metadata-compare.component.scss']
})
export class MetadataCompareComponent implements OnInit {
  @Input() diffs: any;
  @Input() diffColumnWidth: any;

  constructor() {}

  ngOnInit() {}
}
