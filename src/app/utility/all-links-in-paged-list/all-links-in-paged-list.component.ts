import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mdm-all-links-in-paged-list',
  templateUrl: './all-links-in-paged-list.component.html',
  styleUrls: ['./all-links-in-paged-list.component.sass']
})
export class AllLinksInPagedListComponent implements OnInit {
  @Input() parent: any;

  @Input() showDescription: any;
  @Input() showNoLinksMessage: any;
  @Input() showLoadingSpinner: any;
  @Input() type: any;

  mcLinks = {
    refines: [],
    doesNotRefine: [],
    from: [],
    total: 0
  };
  linkTypes = [];
  allLinksMap: any;
  total: any;
  loading = false;

  constructor() {}

  loadLinksStatic() {
    this.linkTypes = [];
    this.allLinksMap = {};
    this.total = 0;
    this.loading = true;
    if (!this.parent.semanticLinks) {
      return;
    }

    this.parent.semanticLinks.forEach(link => {
      if (!this.allLinksMap[link.linkType]) {
        this.allLinksMap[link.linkType] = {
          linkType: link.linkType,
          count: 0,
          links: []
        };
        this.linkTypes.push(link.linkType);
      }
      this.allLinksMap[link.linkType].links.push(link);
      this.allLinksMap[link.linkType].count++;
      this.total++;
    });

    this.loading = false;
  }

  ngOnInit() {
    if (
      !this.parent.semanticLinks ||
      (this.parent.semanticLinks && this.parent.semanticLinks.length === 0)
    ) {
      this.loading = false;
      return;
    }
    this.loading = true;

    this.loadLinksStatic();
    this.loading = false;
  }
}
