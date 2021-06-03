import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'mdm-default-profile',
  templateUrl: './default-profile.component.html',
  styleUrls: ['./default-profile.component.scss']
})
export class DefaultProfileComponent implements OnInit, OnChanges {

 @Input() catalogueItem : any;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {
  }

}
