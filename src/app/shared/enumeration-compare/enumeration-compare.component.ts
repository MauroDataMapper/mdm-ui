import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mdm-enumeration-compare',
  templateUrl: './enumeration-compare.component.html',
  styleUrls: ['./enumeration-compare.component.scss']
})
export class EnumerationCompareComponent implements OnInit {
  @Input() diffs: any;

  constructor() {}

  ngOnInit() {}
}
