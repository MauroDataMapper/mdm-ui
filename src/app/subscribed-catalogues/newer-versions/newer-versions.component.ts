import { Component, Input, OnInit } from '@angular/core';
import { CatalogueItem } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-newer-versions',
  templateUrl: './newer-versions.component.html',
  styleUrls: ['./newer-versions.component.scss']
})
export class NewerVersionsComponent implements OnInit {

  @Input('catalogueItem') catalogueItem : CatalogueItem;

  isLoadingResults: boolean;
  totalItemCount : number;

  constructor() { }

  ngOnInit(): void {
  }

}
