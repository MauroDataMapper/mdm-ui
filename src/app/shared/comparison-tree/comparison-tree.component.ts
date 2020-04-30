import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BroadcastService } from '@mdm/services/broadcast.service';

@Component({
  selector: 'mdm-comparison-tree',
  templateUrl: './comparison-tree.component.html',
  styleUrls: ['./comparison-tree.component.scss']
})
export class ComparisonTreeComponent implements OnInit {
  @Input() type: any;
  @Input() treeName: any;
  @Input() val: any;
  @Input() parentData: any;
  @Input() childElementName: any;
  @Input() diffMap: any;

  @Input() nodeExpand: any;
  @Input() nodeClick: any;

  constructor(private broadcastSvc: BroadcastService) {}

  ngOnInit() {
    this.broadcastSvc.subscribe(this.treeName + '-nodeSelected', data => {
      if (this.val && data.node.id !== this.val.id && this.val.selected) {
        this.val.selected = false;
      }
    });

    if (this.childElementName && this.val && this.val[this.childElementName]) {
      this.val.items = [].concat(this.val[this.childElementName]);
    }

    if (this.val.close !== false) {
      this.val.close = true;
    }
  }

  deleteMe = index => {
    if (this.parentData) {
      const itemIndex = this.parentData.indexOf(this.val);
      this.parentData.splice(itemIndex, 1);
    }
    this.val = {};
  };

  toggleExpand = () => {
    if (this.type === 'dynamic' && this.nodeExpand) {
      this.nodeExpand(this.val).subscribe(data => {
        this.val.items = data;
        this.val.close = !this.val.close;
      });
    } else {
      this.val.close = !this.val.close;
    }
  };

  nodeClickFn = () => {
    this.val.selected = !this.val.selected;
    this.broadcastSvc.broadcast(this.treeName + '-nodeSelected', {
      node: this.val
    });
    if (this.nodeClick) {
      this.nodeClick(this.val);
    }
  }
}
