import { Component, ContentChild, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { InfiniteScrollComponent } from '@mdm/shared/checkbox-infinite-scroll/infinite-scroll.component';
import { MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'mdm-checkbox-infinite-scroll',
  templateUrl: './checkbox-infinite-scroll.component.html',
  styleUrls: ['./checkbox-infinite-scroll.component.scss']
})
export class CheckboxInfiniteScrollComponent extends InfiniteScrollComponent implements OnInit {

  @ContentChild('listItemTemplate', { static: true })
  listItemTemplate: TemplateRef<any>;

  selectedItems : any[] = [];

  @ViewChild('selectBox', { static: true })  selectBox: MatSelectionList;
  @Input() getValue: any;


  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  selectAllChildItems() {
    this.selectBox.selectAll();
  }

  deselectAllChildItems() {
    this.selectBox.deselectAll();
  }

}
